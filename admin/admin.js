import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://llqhrmvujiyobrgwwoki.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_zjfh7jB-6YRrjtPWIu-6fQ_Qw55zYho';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true }
});

const BACKEND_BASE = window.location.hostname.includes('localhost')
    ? 'http://localhost:3000'
    : 'https://back-end-nova.vercel.app';

const views = {
    login: document.getElementById('view-login'),
    dashboard: document.getElementById('view-dashboard'),
    detail: document.getElementById('view-detail')
};

const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const adminUserEl = document.getElementById('adminUser');

const registrationsTable = document.getElementById('registrationsTable');
const registrationsBody = registrationsTable ? registrationsTable.querySelector('tbody') : null;
const pageInfo = document.getElementById('pageInfo');

const filterType = document.getElementById('filterType');
const filterStatus = document.getElementById('filterStatus');
const filterFrom = document.getElementById('filterFrom');
const filterTo = document.getElementById('filterTo');
const filterQuery = document.getElementById('filterQuery');
const applyFilters = document.getElementById('applyFilters');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');

const detailContent = document.getElementById('detailContent');
const documentsList = document.getElementById('documentsList');
const backToList = document.getElementById('backToList');
const statusSelect = document.getElementById('statusSelect');
const updateStatus = document.getElementById('updateStatus');

const state = {
    page: 1,
    pageSize: 20,
    total: 0,
    registrationId: null
};

function showView(name) {
    Object.values(views).forEach(view => {
        if (view) view.classList.add('hidden');
    });
    if (views[name]) views[name].classList.remove('hidden');
}

function setLoginMessage(message, isError = true) {
    if (!loginMessage) return;
    loginMessage.textContent = message;
    loginMessage.className = `message ${isError ? 'error' : 'success'}`;
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString('pt-BR');
}

function formatValue(value) {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Nao';
    return value;
}

async function getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session || null;
}

async function apiFetch(path, options = {}) {
    const session = await getSession();
    if (!session) throw new Error('Sessao expirada');

    const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${session.access_token}`
    };

    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${BACKEND_BASE}${path}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        let errorMessage = 'Falha na requisicao';
        try {
            const data = await response.json();
            errorMessage = data.message || data.error || errorMessage;
        } catch (e) {
            errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
    }

    return response.json();
}

async function ensureAdminSession() {
    const session = await getSession();
    if (!session) return null;

    try {
        const adminInfo = await apiFetch('/api/admin/me');
        adminUserEl.textContent = adminInfo.email || '';
        return adminInfo;
    } catch (error) {
        await supabase.auth.signOut();
        return null;
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginMessage('');

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        setLoginMessage('Falha no login. Verifique email e senha.');
        return;
    }

    const adminInfo = await ensureAdminSession();
    if (!adminInfo) {
        setLoginMessage('Sem permissao para acessar este painel.');
        return;
    }

    navigate('/admin');
}

function renderTable(items) {
    if (!registrationsBody) return;
    registrationsBody.innerHTML = '';

    if (!items.length) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 9;
        cell.textContent = 'Nenhum cadastro encontrado.';
        row.appendChild(cell);
        registrationsBody.appendChild(row);
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        const cells = [
            item.type,
            item.name,
            item.cpf_cnpj,
            item.email,
            item.phone,
            `${item.city}${item.state ? `/${item.state}` : ''}`,
            item.status,
            formatDate(item.created_at)
        ];

        cells.forEach((value, index) => {
            const cell = document.createElement('td');
            if (index === 6) {
                const badge = document.createElement('span');
                badge.className = `status-badge status-${(value || '').toLowerCase()}`;
                badge.textContent = value || '-';
                cell.appendChild(badge);
            } else {
                cell.textContent = formatValue(value);
            }
            row.appendChild(cell);
        });

        const actionCell = document.createElement('td');
        const actionButton = document.createElement('button');
        actionButton.className = 'btn-link';
        actionButton.textContent = 'Ver detalhes';
        actionButton.addEventListener('click', () => {
            navigate(`/admin/cadastros/${item.id}`);
        });
        actionCell.appendChild(actionButton);
        row.appendChild(actionCell);

        registrationsBody.appendChild(row);
    });
}

async function loadRegistrations() {
    const params = new URLSearchParams({
        page: state.page,
        pageSize: state.pageSize
    });

    if (filterType.value) params.set('type', filterType.value);
    if (filterStatus.value) params.set('status', filterStatus.value);
    if (filterFrom.value) params.set('from', filterFrom.value);
    if (filterTo.value) params.set('to', filterTo.value);
    if (filterQuery.value) params.set('query', filterQuery.value);

    const result = await apiFetch(`/api/admin/registrations?${params.toString()}`);
    state.total = result.total;

    renderTable(result.items || []);
    const totalPages = Math.max(Math.ceil(result.total / state.pageSize), 1);
    pageInfo.textContent = `Pagina ${state.page} de ${totalPages}`;
    prevPage.disabled = state.page <= 1;
    nextPage.disabled = state.page >= totalPages;
}

function renderDetailSection(title, entries) {
    const card = document.createElement('div');
    card.className = 'detail-card';

    const heading = document.createElement('h3');
    heading.textContent = title;
    card.appendChild(heading);

    const list = document.createElement('dl');
    entries.forEach(([label, value]) => {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = formatValue(value);
        list.appendChild(dt);
        list.appendChild(dd);
    });

    card.appendChild(list);
    return card;
}

function renderDocuments(files) {
    documentsList.innerHTML = '';

    if (!files.length) {
        documentsList.textContent = 'Nenhum documento anexado.';
        return;
    }

    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'doc-item';

        const info = document.createElement('div');
        info.className = 'doc-info';
        const name = document.createElement('div');
        name.className = 'doc-name';
        name.textContent = file.metadata?.original_name || file.file_type || 'Documento';
        const meta = document.createElement('div');
        meta.className = 'doc-meta';
        meta.textContent = `${file.file_type || ''} ${file.metadata?.mime_type || ''}`.trim();
        info.appendChild(name);
        info.appendChild(meta);

        if (file.signed_url && file.metadata?.mime_type?.startsWith('image/')) {
            const preview = document.createElement('img');
            preview.src = file.signed_url;
            preview.alt = name.textContent;
            preview.className = 'doc-preview';
            info.appendChild(preview);
        }

        const actions = document.createElement('div');
        actions.className = 'doc-actions';
        if (file.signed_url) {
            const openLink = document.createElement('a');
            openLink.href = file.signed_url;
            openLink.target = '_blank';
            openLink.rel = 'noreferrer';
            openLink.className = 'btn-secondary';
            openLink.textContent = 'Abrir';
            actions.appendChild(openLink);
        }

        item.appendChild(info);
        item.appendChild(actions);
        documentsList.appendChild(item);
    });
}

async function loadRegistrationDetail(id) {
    const result = await apiFetch(`/api/admin/registrations/${id}`);
    const registration = result.registration;
    const payload = registration.payload || {};

    detailContent.innerHTML = '';

    const isPF = registration.type === 'PF';
    const address = payload.address || {};

    const mainEntries = isPF
        ? [
            ['Nome completo', payload.fullName],
            ['Email', payload.email],
            ['Telefone', payload.phone],
            ['CPF', payload.cpf],
            ['RG', payload.rg],
            ['CNH', payload.cnh],
            ['Data de nascimento', payload.birthDate],
            ['Estrangeiro', payload.isForeigner],
            ['Protocolo', registration.protocol_number]
        ]
        : [
            ['Razao social', payload.companyName],
            ['Nome fantasia', payload.tradeName],
            ['CNPJ', payload.cnpj],
            ['Data de fundacao', payload.foundationDate],
            ['CNAE principal', payload.mainCNAE],
            ['Email', payload.companyEmail],
            ['Telefone', payload.companyPhone],
            ['Natureza juridica', payload.legalNature],
            ['Protocolo', registration.protocol_number]
        ];

    const addressEntries = isPF
        ? [
            ['CEP', address.cep || address.zipCode],
            ['Logradouro', address.street],
            ['Numero', address.number],
            ['Complemento', address.complement],
            ['Bairro', address.district],
            ['Cidade', address.city],
            ['Estado', address.state],
            ['Pais', address.country]
        ]
        : [
            ['CEP', address.cep],
            ['Logradouro', address.street],
            ['Numero', address.number],
            ['Complemento', address.complement],
            ['Bairro', address.district],
            ['Cidade', address.city],
            ['Estado', address.state]
        ];

    detailContent.appendChild(renderDetailSection('Dados principais', mainEntries));
    detailContent.appendChild(renderDetailSection('Endereco', addressEntries));

    if (isPF) {
        detailContent.appendChild(renderDetailSection('PEP', [
            ['PEP', payload.pepStatus],
            ['Cargo', payload.pepPosition]
        ]));
    } else {
        const admin = payload.majorityAdmin || {};
        detailContent.appendChild(renderDetailSection('Representante', [
            ['Nome', admin.name],
            ['CPF', admin.cpf],
            ['Email', admin.email],
            ['Telefone', admin.phone]
        ]));
    }

    statusSelect.value = registration.status || 'NOVO';
    renderDocuments(result.files || []);
}

function navigate(path) {
    if (window.location.pathname !== path) {
        window.history.pushState({}, '', path);
    }
    renderRoute();
}

async function renderRoute() {
    const path = window.location.pathname;

    if (path === '/admin/logout') {
        await supabase.auth.signOut();
        window.location.replace('/admin/login');
        return;
    }

    if (path.startsWith('/admin/login')) {
        const adminInfo = await ensureAdminSession();
        if (adminInfo) {
            navigate('/admin');
            return;
        }
        showView('login');
        return;
    }

    const adminInfo = await ensureAdminSession();
    if (!adminInfo) {
        window.location.replace('/admin/login');
        return;
    }

    if (path.startsWith('/admin/cadastros/')) {
        const id = path.split('/admin/cadastros/')[1];
        state.registrationId = id;
        showView('detail');
        await loadRegistrationDetail(id);
        return;
    }

    showView('dashboard');
    await loadRegistrations();
}

if (loginForm) {
    loginForm.addEventListener('submit', handleLoginSubmit);
}

if (applyFilters) {
    applyFilters.addEventListener('click', () => {
        state.page = 1;
        loadRegistrations();
    });
}

if (prevPage) {
    prevPage.addEventListener('click', () => {
        if (state.page > 1) {
            state.page -= 1;
            loadRegistrations();
        }
    });
}

if (nextPage) {
    nextPage.addEventListener('click', () => {
        const totalPages = Math.max(Math.ceil(state.total / state.pageSize), 1);
        if (state.page < totalPages) {
            state.page += 1;
            loadRegistrations();
        }
    });
}

if (backToList) {
    backToList.addEventListener('click', () => navigate('/admin'));
}

if (updateStatus) {
    updateStatus.addEventListener('click', async () => {
        if (!state.registrationId) return;
        const newStatus = statusSelect.value;
        await apiFetch(`/api/admin/registrations/${state.registrationId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });
        await loadRegistrationDetail(state.registrationId);
    });
}

document.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        navigate(link.getAttribute('href'));
    });
});

window.addEventListener('popstate', renderRoute);
renderRoute();

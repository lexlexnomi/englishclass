// Função para fazer requisições ao backend
const API_BASE_URL = 'https://english-backend-tsax.onrender.com';

async function fetchData(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`; // Agora sempre usa a URL do backend
    console.log(`Fetching data from ${url}`); // Log de depuração

    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error('Erro ao buscar dados:', error); // Log de depuração
        return [];
    }
}

// Função para carregar atividades
async function carregarAtividades() {
    const atividades = await fetchData('/api/atividades');
    console.log('Atividades retornadas:', atividades); // Log de depuração

    const tbody = document.getElementById('lista-atividades');
    if (tbody) {
        tbody.innerHTML = '';

        atividades.forEach(atividade => {
            console.log('Atividade:', atividade); // Log de depuração
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" ${atividade.concluida ? 'checked' : ''} onchange="marcarConcluida(${atividade.id}, event)"></td>
                <td>${atividade.titulo}</td>
                <td>Aula ${atividade.numero_aula}</td>
                <td>${atividade.data}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Função para adicionar uma nova atividade
function configurarFormAtividade() {
    const formAtividade = document.getElementById('form-atividade');
    if (formAtividade) {
        formAtividade.addEventListener('submit', async (event) => {
            event.preventDefault();

            const titulo = document.getElementById('titulo-atividade').value;
            const data = document.getElementById('data-atividade').value;
            const numeroAula = document.getElementById('numero-aula').value;

            await fetchData('/api/atividades', 'POST', { titulo, data, numero_aula: numeroAula });
            carregarAtividades();
        });
    }
}

// Função para marcar atividade como concluída
async function marcarConcluida(id, event) {
    const concluida = event.target.checked; // Verifica se o checkbox está marcado

    await fetchData(`/api/atividades/${id}/concluir`, 'PUT', { concluida });

    // Atualiza o status da atividade no backend
    console.log(`Atividade ${id} marcada como ${concluida ? 'concluída' : 'pendente'}`);
}

// Função para carregar textos
async function carregarTextos() {
    const textos = await fetchData('/api/textos');
    console.log('Textos retornados:', textos); // Log de depuração

    const tbody = document.getElementById('lista-textos');
    if (tbody) {
        tbody.innerHTML = '';

        textos.forEach(texto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="titulo-texto">
                    ${texto.titulo}
                    <span class="abrir-texto">Clique para abrir</span>
                </td>
                <td>Aula ${texto.numero_aula}</td>
                <td>${texto.tema}</td>
            `;
            tbody.appendChild(row);
            
            // Abre o modal com o conteúdo do texto
            row.querySelector('.titulo-texto').addEventListener('click', () => abrirModal("texto", texto.id));
        });
    }
}

// Função para adicionar um novo texto
function configurarFormTexto() {
    const formTexto = document.getElementById('form-texto');
    if (formTexto) {
        formTexto.addEventListener('submit', async (event) => {
            event.preventDefault();

            const titulo = document.getElementById('titulo-texto').value;
            const numeroAula = document.getElementById('numero-aula').value;

            // Captura o tema selecionado ou o novo tema
            const tema = $('#temas-textos').val();
            console.log('Tema capturado:', tema);

            const conteudo = document.getElementById('conteudo-texto').value;

            // Buscar todas as aulas primeiro
            const aulas = await fetchData('/api/aulas');
            const aulaId = encontrarIdDaAula(aulas, numeroAula);

            if (!aulaId) {
                console.error('Erro: Não foi possível encontrar a aula correspondente.');
                return;
            }

            await fetchData('/api/textos', 'POST', { 
                titulo, 
                aula_id: aulaId, // Agora enviando o ID correto
                tema, 
                conteudo 
            });
            
            carregarTextos();
        });
    }
}

//Função para abrir o modal
async function abrirModal(tipo, id) {
    try {
        // Busca o texto pelo ID na API
        let dados;
        if (tipo === "texto") {
            dados = await fetchData(`/api/textos/${id}`);
            console.log('Texto retornado:', dados); // LOG PARA DEBUG
        } else if (tipo === "duvida") {
            dados = await fetchData(`/api/duvidas/${id}`);
            console.log('Duvida retornada:', dados); // LOG PARA DEBUG
        } else {
            console.error("Tipo inválido.");
            return;
        }

        // Exibe o modal
        const modal = document.getElementById('modal');
        const modalTitulo = document.getElementById('modal-titulo');
        const modalContent = document.getElementById('modal-content');

        modalTitulo.textContent = dados.titulo || "Sem título";
        modalContent.textContent = dados.conteudo || "Sem conteúdo";
        modal.style.display = 'block';
    } catch (error) {
        console.error(`Erro ao buscar ${tipo}:`, error);
    }
}

// Função para carregar vocabulários
async function carregarVocabularios() {
    const vocabularios = await fetchData('/api/vocabularios');
    console.log('Vocabulários retornados:', vocabularios); // Log de depuração

    const tbody = document.getElementById('lista-vocabularios');
    if (tbody) {
        tbody.innerHTML = '';

        vocabularios.forEach(vocabulario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vocabulario.palavra}</td>
                <td>Aula ${vocabulario.numero_aula}</td>
                <td>${vocabulario.tema}</td>
                <td>${vocabulario.significado}</td>
                <td>${vocabulario.frase_exemplo}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Função para adicionar um novo vocabulário
function configurarFormVocabulario() {
    const formVocabulario = document.getElementById('form-vocabulario');
    if (formVocabulario) {
        formVocabulario.addEventListener('submit', async (event) => {
            event.preventDefault();

            const numeroAula = document.getElementById('numero-aula').value;
            const palavra = document.getElementById('palavra').value;
            const significado = document.getElementById('significado').value;

            // Captura o tema selecionado ou o novo tema
            const tema = $('#temas-vocabularios').val();
            console.log('Tema capturado:', tema);

            const fraseExemplo = document.getElementById('frase-exemplo').value;

            // Buscar todas as aulas primeiro
            const aulas = await fetchData('/api/aulas');
            const aulaId = encontrarIdDaAula(aulas, numeroAula);

            if (!aulaId) {
                console.error('Erro: Não foi possível encontrar a aula correspondente.');
                return;
            }

            await fetchData('/api/vocabularios', 'POST', {  
                aula_id: aulaId, // Agora enviando o ID correto
                palavra,
                significado,
                tema, 
                frase_exemplo: fraseExemplo
            });

            carregarVocabularios();
        });
    }
}

// Função para preencher as opções do Select2 com temas
async function carregarTemas() {
    try {
        const temas = await fetchData('/api/temas'); // API de temas
        console.log('Temas retornados:', temas); // Log de depuração

        // Seletor de temas para textos
        const temasTextosElement = $('#temas-textos');
        // Seletor de temas para vocabulários
        const temasVocabulariosElement = $('#temas-vocabularios');

        // Verifica se os elementos existem no HTML
        if (!temasTextosElement.length || !temasVocabulariosElement.length) return;

        // Limpar os seletores antes de adicionar as novas opções
        temasTextosElement.empty();
        temasVocabulariosElement.empty();

        // Adiciona a opção inicial
        temasTextosElement.append(new Option('Selecione um tema para textos', ''));
        temasVocabulariosElement.append(new Option('Selecione um tema para vocabulários', ''));

        // Preencher os dois selects com as opções de temas
        temas.forEach(tema => {
            const option = new Option(tema.nome, tema.id);
            temasTextosElement.append(option);
            temasVocabulariosElement.append(option);
        });

        // Atualiza o select2 nos dois campos
        temasTextosElement.trigger('change');
        temasVocabulariosElement.trigger('change');
        
    } catch (error) {
        console.error('Erro ao carregar os temas:', error); // Log de erro
    }
}

// Função para carregar dúvidas
async function carregarDuvidas() {
    const duvidas = await fetchData('/api/duvidas');
    console.log('Dúvidas retornadas:', duvidas); // Log de depuração

    const tbody = document.getElementById('lista-duvidas');
    if (tbody) {
        tbody.innerHTML = '';

        duvidas.forEach(duvida => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" ${duvida.resolvida ? 'checked' : ''} onchange="marcarResolvida(${duvida.id}, event)"></td>
                <td class="titulo-duvida">
                    ${duvida.titulo}
                    <span class="abrir-duvida">Clique para abrir</span>
                </td>
                <td>Aula ${duvida.numero_aula}</td>
                <td>${duvida.tag}</td>
                <td>${duvida.descricao}</td>
            `;
            tbody.appendChild(row);

            // Abre o modal com o conteúdo da dúvida
            row.querySelector('.titulo-duvida').addEventListener('click', () => abrirModal("duvida", duvida.id));
        });
    }
}

// Função para adicionar uma nova dúvida
function configurarFormDuvida() {
    const formDuvida = document.getElementById('form-duvida');
    if (formDuvida) {
        formDuvida.addEventListener('submit', async (event) => {
            event.preventDefault();

            const titulo = document.getElementById('titulo-duvida').value;
            const numeroAula = document.getElementById('numero-aula').value;

            // Captura a tag selecionada ou a nova tag
            const tags = $('#tags').val();
            console.log('Tag capturada:', tags);

            const descricao = document.getElementById('descricao-duvida').value;

            // Buscar todas as aulas primeiro
            const aulas = await fetchData('/api/aulas');
            const aulaId = encontrarIdDaAula(aulas, numeroAula);

            if (!aulaId) {
                console.error('Erro: Não foi possível encontrar a aula correspondente.');
                return;
            }

            await fetchData('/api/duvidas', 'POST', { 
                titulo, 
                aula_id: aulaId, // Agora enviando o ID correto
                tags, 
                descricao 
            });

            carregarDuvidas();
        });
    }
}

// Função para preencher as opções do Select2 com tags
async function carregarTags() {
    const tags = await fetchData('/api/duvidas/tags');
    console.log('Tags retornadas:', tags); // Log de depuração

    const tagsElement = $('#tags');

    if (tagsElement) {
        // Limpando as opções existentes
        tagsElement.empty();
        
        // Adiciona as opções de categorias no seletor
        tags.forEach(tag => {
            const option = new Option(tag.nome, tag.id);
            tagsElement.append(option);
        });

        // Re-inicializa o select2 com as novas opções
        tagsElement.trigger('change');
    }
}

// Função para marcar dúvida como resolvida
async function marcarResolvida(id, event) {
    const resolvida = event.target.checked; // Verifica se o checkbox está marcado

    await fetchData(`/api/duvidas/${id}/resolver`, 'PUT', { resolvida });

    // Atualiza o status da atividade no backend
    console.log(`Dúvida ${id} marcada como ${resolvida ? 'resolvida' : 'pendente'}`);
}

// Função para carregar recursos
async function carregarRecursos() {
    const recursos = await fetchData('/api/recursos');
    console.log('recursos retornados:', recursos); // Log de depuração

    const tbody = document.getElementById('lista-recursos');
    if (tbody) {
        tbody.innerHTML = '';

        recursos.forEach(recurso => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${recurso.nome}</td>
                <td>${recurso.categorias.join(' ')}</td>
                <td>${recurso.descricao}</td>
                <td><a href="${recurso.url}" target="_blank">Acessar</a></td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Função para adicionar um novo recurso
function configurarFormRecurso() {
    const formRecurso = document.getElementById('form-recurso');
    if (formRecurso) {
        formRecurso.addEventListener('submit', async (event) => {
            event.preventDefault();

            const nome = document.getElementById('nome-recurso').value;
            
            // Captura a categoria selecionada ou a nova categoria
            const categorias = $('#categorias').val();
            console.log('Categorias capturadas:', categorias);

            const url = document.getElementById('url-recurso').value;
            const descricao = document.getElementById('descricao-recurso').value;

            await fetchData('/api/recursos', 'POST', { nome, categorias, url, descricao });

            carregarRecursos();
        });
    }
}

// Função para preencher as opções do Select2 com categorias
async function carregarCategorias() {
    const categorias = await fetchData('/api/recursos/categorias');
    console.log('Categorias retornadas:', categorias); // Log de depuração

    const categoriasElement = $('#categorias');

    if (categoriasElement) {
        // Limpando as opções existentes
        categoriasElement.empty();
        
        // Adiciona as opções de categorias no seletor
        categorias.forEach(categoria => {
            const option = new Option(categoria.nome, categoria.id);
            categoriasElement.append(option);
        });

        // Re-inicializa o select2 com as novas opções
        categoriasElement.trigger('change');
    }
}

// Função para carregar aulas
async function carregarAulas() {
    console.log('Função carregarAulas chamada.');
    const aulas = await fetchData('/api/aulas');
    console.log('Aulas retornadas', aulas);
    const selectAula = document.getElementById('aula');
    if (selectAula) {
        selectAula.innerHTML = '<option value="">Selecione uma aula</option>';

        aulas.forEach(aula => {
            const option = document.createElement('option');
            option.value = aula.numero;
            option.textContent = `Aula ${aula.numero} - ${aula.data}`;
            selectAula.appendChild(option);
        });
    }
}

//Mapear o id com base no numero
function encontrarIdDaAula(aulas, numeroAula) {
    const aula = aulas.find(a => a.numero === parseInt(numeroAula));
    return aula ? aula.id : null;
}

// Função para carregar o Dashboard
async function carregarDashboard() {
    const aulaNumero = document.getElementById('aula').value;
    console.log('Aula selecionada:', aulaNumero);

    if (!aulaNumero) {
        alert('Selecione uma aula.');
        return;
    }

    // Buscar atividades da aula
    const atividades = await fetchData(`/api/atividades/aula/${aulaNumero}`);
    console.log('Atividades retornadas:', atividades); // Log de depuração

    const tbodyAtividades = document.getElementById('lista-atividades');
    if (tbodyAtividades) {
        tbodyAtividades.innerHTML = '';

        atividades.forEach(atividade => {
            console.log('Atividade do Dashboard:', atividade); // Log de depuração
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" ${atividade.concluida ? 'checked' : ''} onchange="marcarConcluida(${atividade.id}, event)"></td>
                <td>${atividade.titulo}</td>
                <td>Aula ${atividade.numero_aula}</td>
                <td>${atividade.data}</td>
            `;
            tbodyAtividades.appendChild(row);
        });
    }

    // Buscar textos da aula
    const textos = await fetchData(`/api/textos/aula/${aulaNumero}`);
    console.log('Textos retornados:', textos); // Log de depuração

    const tbodyTextos = document.getElementById('lista-textos');
    if (tbodyTextos) {
        tbodyTextos.innerHTML = '';

        textos.forEach(texto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="titulo-texto">
                    ${texto.titulo}
                    <span class="abrir-texto">Clique para abrir</span>
                </td>
                <td>Aula ${texto.numero_aula}</td>
                <td>${texto.tema}</td>
            `;
            tbodyTextos.appendChild(row);

            // Abre o modal com o conteúdo do texto
            row.querySelector('.titulo-texto').addEventListener('click', () => abrirModal("texto", texto.id));
        });
    }

    // Buscar vocabulários da semana
    const vocabularios = await fetchData(`/api/vocabularios/aula/${aulaNumero}`);
    console.log('Vocabulários retornados:', vocabularios); // Log de depuração

    const tbodyVocabularios = document.getElementById('lista-vocabularios');
    if (tbodyVocabularios) {
        tbodyVocabularios.innerHTML = '';

        vocabularios.forEach(vocabulario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vocabulario.palavra}</td>
                <td>Aula ${vocabulario.numero_aula}</td>
                <td>${vocabulario.tema}</td>
                <td>${vocabulario.significado}</p></td>
                <td>${vocabulario.frase_exemplo}</td>
            `;
            tbodyVocabularios.appendChild(row);
        });
    }

    // Buscar dúvidas da semana
    const duvidas = await fetchData(`/api/duvidas/aula/${aulaNumero}`);
    console.log('Dúvidas retornadas:', duvidas); // Log de depuração

    const tbodyDuvidas = document.getElementById('lista-duvidas');
    if (tbodyDuvidas) {
        tbodyDuvidas.innerHTML = '';

        duvidas.forEach(duvida => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" ${duvida.resolvida ? 'checked' : ''} onchange="marcarResolvida(${duvida.id}, event)"></td>
                <td class="titulo-duvida">
                    ${duvida.titulo}
                    <span class="abrir-duvida">Clique para abrir</span>
                </td>
                <td>Aula ${duvida.numero_aula}</td>
                <td>${duvida.tag}</td>
                <td>${duvida.descricao}</td>
            `;
            tbodyDuvidas.appendChild(row);

            // Abre o modal com o conteúdo da dúvida
            row.querySelector('.titulo-duvida').addEventListener('click', () => abrirModal("duvida", duvida.id));
        });
    }

    console.log('Atividades:', atividades);
    console.log('Textos:', textos);
    console.log('Vocabulários:', vocabularios);
    console.log('Dúvidas:', duvidas);
}

// Configurar eventos ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado.'); // Log de depuração

    // Verificar em qual página estamos e configurar os eventos correspondentes
    if (window.location.pathname.endsWith('activities.html')) {
        configurarFormAtividade();
        carregarAtividades();
    } else if (window.location.pathname.endsWith('texts.html')) {
        carregarTemas();
        configurarFormTexto();
        carregarTextos();
    } else if (window.location.pathname.endsWith('vocabularies.html')) {
        carregarTemas();
        configurarFormVocabulario();
        carregarVocabularios();
    } else if (window.location.pathname.endsWith('questions.html')) {
        carregarTags();
        configurarFormDuvida();
        carregarDuvidas();
    } else if (window.location.pathname.endsWith('resources.html')) {
        carregarCategorias();
        configurarFormRecurso();
        carregarRecursos();
    } else if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        carregarAulas();
        document.getElementById('aula').addEventListener('change', carregarDashboard);
    }


    // Inicializa o Select2 para os seletores
    $('#tags').select2({
        placeholder: "Selecione uma tag",
        tags: true, // Habilita a criação de novas opções
        allowClear: true // Permite limpar a seleção
    });

    $('#temas-textos').select2({
        placeholder: "Selecione um tema",
        tags: true,
        allowClear: true
    });

    $('#temas-vocabularios').select2({
        placeholder: "Selecione um tema",
        tags: true,
        allowClear: true
    });

    $('#categorias').select2({
        placeholder: "Selecione até 3 categorias",
        tags: true,
        maximumSelectionLength: 3, // Limita a seleção a 3 itens
        allowClear: true
    });

    //Fechar o modal
    const modal = document.getElementById("modal");
    const modalContent = document.querySelector(".modal-content");
    const fecharModalBtn = document.querySelector(".fechar-modal");
    
    // Fecha o modal ao clicar no botão de fechar (X)
    fecharModalBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (modal && modalContent && !modalContent.contains(event.target)) {
            modal.style.display = 'none';
        }
    });
});

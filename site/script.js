document.addEventListener('DOMContentLoaded', async () => {
    const deputadosContainer = document.getElementById('deputados-container');
    const searchInput = document.getElementById('search-input');
    const voteFilter = document.getElementById('vote-filter');
    const groupFilter = document.getElementById('group-filter');
    const voteCount = document.getElementById('vote-count');

    const deputados = await fetchDeputados();
    updateVoteCount(deputados);

    function renderDeputados(filteredDeputados) {
        deputadosContainer.innerHTML = '';

        let groupedDeputados = {}; 

        // Agrupa os deputados com base no filtro selecionado (partido ou estado)
        filteredDeputados.forEach(deputado => {
            const groupKey = groupFilter.value === 'partido' ? deputado.siglaPartido : 
                             groupFilter.value === 'estado' ? deputado.estado : 
                             'Todos';

            if (!groupedDeputados[groupKey]) {
                groupedDeputados[groupKey] = [];
            }
            groupedDeputados[groupKey].push(deputado);
        });

        // Renderiza os grupos de deputados
        Object.keys(groupedDeputados).forEach(group => {
            // Cria um container para o grupo
            const groupContainer = document.createElement('div');
            groupContainer.classList.add('group-container');

            // Cria o título do grupo
            const groupTitle = document.createElement('div');
            groupTitle.classList.add('group-title');
            groupTitle.textContent = groupFilter.value === 'partido' ? `Partido: ${group}` : 
                                      groupFilter.value === 'estado' ? `Estado: ${group}` : 
                                      'Todos';
            groupContainer.appendChild(groupTitle);

            // Cria os cartões de deputados para o grupo
            const deputadosGroup = document.createElement('div');
            deputadosGroup.classList.add('deputados-group');
            groupedDeputados[group].forEach(deputado => {
                const deputadoCard = document.createElement('div');
                deputadoCard.classList.add('deputado-card');

                // Adiciona estilos de voto
                if (deputado.voto === 'Sim') {
                    deputadoCard.classList.add('voto-sim');
                } else if (deputado.voto === 'Não') {
                    deputadoCard.classList.add('voto-nao');
                } else {
                    deputadoCard.classList.add('voto-ausente');
                }

                deputadoCard.innerHTML = `
                    <img src="${deputado.urlFoto}" alt="Foto de ${deputado.nome}">
                    <h2>${deputado.nome}</h2>
                    <p>${deputado.siglaPartido}</p>
                    <p>${`Estado: ${deputado.estado}`}</p>
                    <p>${deputado.voto ? `Assinou: ${deputado.voto}` : 'Não'}</p>
                `;
                deputadosGroup.appendChild(deputadoCard);
            });

            groupContainer.appendChild(deputadosGroup);
            deputadosContainer.appendChild(groupContainer);
        });
    }

    function filterDeputados() {
        const searchText = searchInput.value.toLowerCase();
        const voteType = voteFilter.value;

        const filteredDeputados = deputados.filter(deputado => {
            const matchesName = deputado.nome.toLowerCase().includes(searchText);
            const matchesVote = voteType ? deputado.voto === voteType : true;
            return matchesName && matchesVote;
        });

        renderDeputados(filteredDeputados);
        updateVoteCount(filteredDeputados);

    }

    function updateVoteCount(deputados) {
        const totalSim = deputados.filter(dep => dep.voto === 'Sim').length;
        const totalNao = deputados.length - totalSim;
        voteCount.textContent = `Assinaram: ${totalSim} | Não assinaram: ${totalNao}`;
    }

    searchInput.addEventListener('input', filterDeputados);
    voteFilter.addEventListener('change', filterDeputados);
    groupFilter.addEventListener('change', filterDeputados);

    renderDeputados(deputados);
});

async function fetchDeputados() {
    const response = await axios.get('https://dadosabertos.camara.leg.br/api/v2/deputados');
    const votosResponse = await axios.get('https://us-central1-escala6x1votos.cloudfunctions.net/getVotos');
    
    const votos = votosResponse.data.dados;

    return response.data.dados.map(deputado => {
        const votoInfo = votos.find(voto => voto.deputado_.id === deputado.id);
        return {
            id: deputado.id,
            nome: deputado.nome,
            siglaPartido: deputado.siglaPartido,
            urlFoto: deputado.urlFoto,
            estado: deputado.siglaUf,
            voto: votoInfo ? votoInfo.tipoVoto : 'Não'
        };
    });
}

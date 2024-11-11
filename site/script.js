document.addEventListener('DOMContentLoaded', async () => {
    const deputadosContainer = document.getElementById('deputados-container');
    const searchInput = document.getElementById('search-input');
    const voteFilter = document.getElementById('vote-filter');

    const deputados = await fetchDeputados();

    function renderDeputados(filteredDeputados) {
        deputadosContainer.innerHTML = '';
        filteredDeputados.forEach(deputado => {
            const deputadoCard = document.createElement('div');
            deputadoCard.classList.add('deputado-card');

            if (deputado.voto === 'Sim') {
                deputadoCard.classList.add('voto-sim');
            } else if (deputado.voto === 'Não') {
                deputadoCard.classList.add('voto-nao');
            } else {
                deputadoCard.classList.add('voto-nao');
            }

            deputadoCard.innerHTML = `
                <img src="${deputado.urlFoto}" alt="Foto de ${deputado.nome}">
                <h2>${deputado.nome}</h2>
                <p>${deputado.siglaPartido}</p>
                <p>${deputado.voto ? `Assinou: ${deputado.voto}` : 'Não'}</p>
            `;

            deputadosContainer.appendChild(deputadoCard);
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
    }

    searchInput.addEventListener('input', filterDeputados);
    voteFilter.addEventListener('change', filterDeputados);

    renderDeputados(deputados);
});

async function fetchDeputados() {
    const response = await axios.get('https://dadosabertos.camara.leg.br/api/v2/deputados');
    const votosResponse = await axios.get('https://us-central1-escala6x1votos.cloudfunctions.net/getVotos');
    
    // Supondo que o votosResponse.data.dados é a lista de votos conforme o JSON fornecido
    const votos = votosResponse.data.dados;

    return response.data.dados.map(deputado => {
        const votoInfo = votos.find(voto => voto.deputado_.id === deputado.id);
        return {
            id: deputado.id,
            nome: deputado.nome,
            siglaPartido: deputado.siglaPartido,
            urlFoto: deputado.urlFoto,
            voto: votoInfo ? votoInfo.tipoVoto : 'Não'
        };
    });
}

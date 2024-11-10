document.addEventListener("DOMContentLoaded", async () => {
    const deputadosContainer = document.getElementById("deputados-container");
    const searchInput = document.getElementById("search-input");
    const voteFilter = document.getElementById("vote-filter");

    let deputadosData = [];
    let votosData = [];

    // Carrega os deputados da API
    async function loadDeputados() {
        try {
            const response = await axios.get('https://dadosabertos.camara.leg.br/api/v2/deputados');
            deputadosData = response.data.dados;
            // Após carregar os deputados, carrega os votos
            await loadVotos();
        } catch (error) {
            console.error("Erro ao carregar os deputados:", error);
        }
    }

    // Carrega os votos do arquivo votos.json
    async function loadVotos() {
        try {
            const response = await fetch('votos.json');
            const data = await response.json();
            votosData = data.dados;
            renderDeputados(deputadosData, votosData);
        } catch (error) {
            console.error("Erro ao carregar o arquivo votos.json:", error);
        }
    }

    function renderDeputados(deputados, votos) {
        deputadosContainer.innerHTML = "";
        
        // Para cada deputado, associe os votos
        deputados.forEach(deputado => {
            // Encontre o voto correspondente ao deputado
            const voto = votos.find(v => v.deputado_.id === deputado.id);
            const tipoVoto = voto ? voto.tipoVoto : "Não votou"; // Se não houver voto, exibe "Não votou"
            const deputadoDiv = document.createElement("div");
            deputadoDiv.className = "deputado-card";
            deputadoDiv.style.border = tipoVoto === "Sim" ? "4px solid green" : tipoVoto === "Não" ? "4px solid red" : "4px solid gray";
            deputadoDiv.innerHTML = `
                <img src="${deputado.urlFoto}" alt="${deputado.nome}" class="deputado-foto">
                <h2>${deputado.nome}</h2>
                <p>Partido: ${deputado.siglaPartido} - ${deputado.siglaUf}</p>
                <p>Voto: ${tipoVoto}</p>
            `;
            deputadosContainer.appendChild(deputadoDiv);
        });
    }

    // Filtro por nome e tipo de voto
    searchInput.addEventListener("input", () => filterDeputados());
    voteFilter.addEventListener("change", () => filterDeputados());

    function filterDeputados() {
        const searchTerm = searchInput.value.toLowerCase();
        const voteType = voteFilter.value;
        const filteredDeputados = deputadosData.filter((deputado) => {
            const matchesName = deputado.nome.toLowerCase().includes(searchTerm);
            return matchesName;
        });
        const filteredVotos = votosData.filter((voto) => {
            return voteType === "" || voto.tipoVoto === voteType;
        });

        const filteredData = filteredDeputados.filter(deputado => {
            return filteredVotos.some(voto => voto.deputado_.id === deputado.id);
        });

        renderDeputados(filteredData, filteredVotos);
    }

    // Carrega os deputados ao iniciar
    loadDeputados();
});

<h1 align="center">Gamboa Ocean</h1>

<p align="center">
<strong>
	Plataforma de cartografia em tempo e espaço do projeto Cartografia de Conflitos — Gamboa.
	Adaptada do <a href="https://github.com/bellingcat/ukraine-timemap">ukraine-timemap</a> (Bellingcat),
	por sua vez derivado do <a href="https://github.com/forensic-architecture/timemap">TimeMap</a> (Forensic Architecture).
</strong>
</p>
<br>

## Desenvolvimento
* `npm install` para instalar as dependências
* crie um arquivo `.env.local` na raiz com o token público do Mapbox: `VITE_MAPBOX_TOKEN=pk....` (esse arquivo não vai para o git)
* ajuste as configurações em [config.js](config.js)
* `npm run dev` para rodar localmente
* `npm run build` para gerar os arquivos estáticos em `build/`

## Publicação (GitHub Pages)

A cada push na branch `dev`, o GitHub Actions monta o site (`npm run build`) e publica no GitHub Pages ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)). Isso precisa ser configurado uma vez, nas configurações do repositório no GitHub:

* **Settings → Pages → Source:** "GitHub Actions";
* **Settings → Secrets and variables → Actions:** um secret `MAPBOX_TOKEN` com o token público do Mapbox.

O build usa caminhos relativos (`base: "./"` no [vite.config.js](vite.config.js)), então a pasta `build/` funciona em qualquer endereço: no GitHub Pages ou copiada para o servidor de uma instituição.

## Configurações

<details>
<summary>Documentação do <a href="config.js">config.js</a></summary>

* `SERVER_ROOT` - endereço base dos dados
* `XXXX_EXT` - caminho dos JSONs de eventos, fontes e associações (em `public/data`)
* `DATE_FMT` e `TIME_FMT` - formato de data/hora dos eventos
* `store.app.map` - vista inicial do mapa e limites de zoom
* `store.app.timeline` - intervalos da timeline, níveis de zoom e intervalo inicial
* `store.ui.tiles` - estilos do Mapbox usados como mapa base (padrão e satélite)
* `store.ui.colors` e `store.ui.maxNumOfColors` - cores aplicadas aos filtros selecionados

</details>

## Eventos

Os eventos ficam em [public/data/events.json](public/data/events.json). Cada um aparece na timeline como um quadradinho com o seu código. Ao clicar nele:

* as camadas listadas em `camadas` aparecem no mapa. Camadas de eventos não acionados ficam ocultas; as que nenhum evento lista (mapa base, `bens-tombados`…) não mudam;
* se `MOVE_MAP_ON_EVENT_SELECT` estiver `true` no `config.js`, o mapa vai para a `vista` (hoje está `false`: a vista fica solta);
* a **barra multimídia** ("Informações sobre o evento", à direita) abre se o evento tiver `titulo` ou `multimidia` e for o **único** acionado. Com dois ou mais eventos acionados ela fica recolhida, e a aba dela fica desativada;
* a **barra sociograma** ("Sociograma do evento", à esquerda) abre se o evento tiver `sociograma`.

As duas barras mostram no topo "Evento: " seguido do `titulo` do evento (ou do código, se não houver `titulo`). O X do cabeçalho de cada barra só recolhe a barra.

Vários eventos podem ficar acionados ao mesmo tempo: cada clique aciona o evento ou, se ele já estiver acionado, desaciona. As camadas de todos os eventos acionados aparecem juntas, e cada uma só sai quando o seu evento é desacionado. Com `MOVE_MAP_ON_EVENT_SELECT` ligado, o mapa vai para a `vista` do evento que acabou de ser acionado; ao desacionar, fica onde está. Os eventos acionados ficam com a borda vermelha.

O X da barra multimídia só recolhe a barra: os eventos e as camadas continuam acionados. Ela fica recolhida até a seleção mudar ou até você clicar na aba dela.

```json
{
  "id": "E1",
  "titulo": "PDDU - Gamboa Zeis V + Parque Marinho + Área de Borda Marítima T4",
  "description": "",
  "date": "3/15/2016",
  "latitude": "",
  "longitude": "",
  "associations": [],
  "sources": [],
  "camadas": ["nome-da-camada-no-mapbox", "outra-camada"],
  "vista": { "lat": -12.986, "lng": -38.522, "zoom": 16.5 },
  "multimidia": [
    { "tipo": "texto", "titulo": "Título", "conteudo": "Texto com **negrito** e [links](https://...)" },
    { "tipo": "imagem", "src": "midia/e1/foto.jpg", "legenda": "Legenda" },
    { "tipo": "video", "src": "https://www.youtube.com/watch?v=...", "legenda": "Legenda" },
    { "tipo": "audio", "src": "midia/e1/entrevista.mp3", "legenda": "Legenda" },
    { "tipo": "link", "url": "https://...", "texto": "Texto do link" }
  ],
  "sociograma": [
    { "tipo": "imagem", "src": "midia/e1/sociograma.png" }
  ]
}
```

* `date` segue o formato `M/D/AAAA` (mês/dia/ano). Só o ano define a coluna na timeline; a data define a ordem dentro do ano.
* `camadas` são os nomes (IDs) das camadas no estilo do Mapbox Studio. Deixe essas camadas **ocultas** no Studio. Um nome que não existe no estilo gera um aviso no console do navegador.
* Os campos `titulo`, `camadas`, `vista`, `multimidia` e `sociograma` são opcionais.
* `video` aceita arquivo (`.mp4`) ou link do YouTube/Vimeo. `sociograma` aceita os mesmos tipos de item que `multimidia`.
* Arquivos de mídia vão em `public/midia/` e são referenciados **sem a barra inicial** (`midia/e1/foto.jpg`), para funcionar também no GitHub Pages.

## Popups

Textos que aparecem num quadradinho ao clicar numa feição do mapa ficam em [public/data/popups.json](public/data/popups.json):

```json
{
  "zeis-5[id=5]": "Texto só para a feição da camada zeis-5 com Feature ID 5",
  "savam-apcp[CODIGO=ABC]": "Texto para as feições cujo atributo CODIGO é ABC",
  "savam-apcp[CODIGO=ABC][AREA=10]": "Várias condições: todas precisam valer",
  "zeis-5": "Texto para qualquer outra feição da camada zeis-5"
}
```

* A chave é o nome da camada no Mapbox, seguido de condições opcionais `[atributo=valor]`.
* `id` é o **Feature ID** da feição no Mapbox. Ao subir os dados, o Mapbox transforma o atributo `id` do shapefile no Feature ID. Os outros nomes são atributos da tabela da feição.
* Se mais de uma regra servir para a mesma feição, vale a que tem mais condições.
* O texto aceita formatação simples: `**negrito**`, links e parágrafos separados por `\n\n`.
* Só dá para clicar em camadas visíveis. O cursor vira uma mãozinha em cima de feições que têm texto.
* Com `debug: true` no `config.js`, cada clique no mapa mostra no console do navegador (F12) a camada, o Feature ID e os atributos da feição clicada, para ajudar a escrever as regras.

## Licença
Ver [LICENSE.md](LICENSE.md).

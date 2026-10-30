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

## Licença
Ver [LICENSE.md](LICENSE.md).

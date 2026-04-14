import { DATA_FIELDS, type DatasetSummary } from '../penguins.ts'

type DatasetViewProps = {
  datasetSummary: DatasetSummary
}

export function DatasetView({ datasetSummary }: DatasetViewProps) {
  return (
    <section className="dataset-layout">
      <section className="dataset-hero-card">
        <p className="eyebrow">Data source</p>
        <h2>About this dataset</h2>
        <p className="dataset-copy">
          The app reads Palmer Penguins records from <code>src/data/penguins.json</code>. The explorer view plots only
          complete measurement rows so the chart, legend, and summary cards all use the same subset.
        </p>
      </section>

      <section className="stats-row" aria-label="Dataset summary">
        <section className="stat-card">
          <span className="stat-label">Rows in source</span>
          <strong>{datasetSummary.totalRows.toLocaleString()}</strong>
        </section>
        <section className="stat-card">
          <span className="stat-label">Complete rows used</span>
          <strong>{datasetSummary.completeRows.toLocaleString()}</strong>
        </section>
        <section className="stat-card">
          <span className="stat-label">Dropped rows</span>
          <strong>{datasetSummary.droppedRows.toLocaleString()}</strong>
        </section>
      </section>

      <div className="dataset-grid">
        <section className="info-card">
          <h2>Species counts</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Species</th>
                  <th>Total rows</th>
                  <th>Complete rows</th>
                </tr>
              </thead>
              <tbody>
                {datasetSummary.speciesCounts.map((entry) => (
                  <tr key={entry.species}>
                    <td>{entry.species}</td>
                    <td>{entry.total}</td>
                    <td>{entry.complete}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="info-card">
          <h2>Islands represented</h2>
          <ul className="pill-list">
            {datasetSummary.islands.map((island) => (
              <li key={island}>{island}</li>
            ))}
          </ul>
        </section>

        <section className="info-card info-card-wide">
          <h2>Penguin anatomy reference</h2>
          <figure className="dataset-figure">
            <img
              src="https://allisonhorst.github.io/palmerpenguins/reference/figures/culmen_depth.png"
              alt="Penguin illustration labeling bill dimensions including culmen depth"
              className="dataset-image"
            />
            <figcaption>Artwork by @allison_horst.</figcaption>
          </figure>
        </section>

        <section className="info-card info-card-wide">
          <h2>Available fields and units</h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                {DATA_FIELDS.map((field) => (
                  <tr key={field.label}>
                    <td>{field.label}</td>
                    <td>{field.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="info-card info-card-wide">
          <h2>Note</h2>
          <div className="note-list">
            <p>
              The chart excludes rows with missing beak length, beak depth, flipper length, body mass, species, or
              island values.
            </p>
          </div>
        </section>
      </div>
    </section>
  )
}

function PlaceholderPage({ title, description }) {
  return (
    <section className="placeholder-page">
      <h1>{title}</h1>
      <p>{description}</p>

      <div className="placeholder-card">
        <h3>{title} module</h3>
        <p>This module is being integrated with the TransitOps backend.</p>
      </div>
    </section>
  );
}

export default PlaceholderPage;
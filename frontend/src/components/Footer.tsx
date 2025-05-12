const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>Weather App with Heatmaps & AI</h5>
            <p>Get real-time weather data with interactive heatmaps and AI-powered descriptions.</p>
          </div>
          <div className="col-md-6 text-md-end">
            <p>
              <small>Powered by OpenWeatherMap API & OpenAI</small><br />
              <small>&copy; {new Date().getFullYear()} Weather App. All rights reserved.</small>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
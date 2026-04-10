import './AdBox.css';

function AdBox({ position, count = 3 }) {
  return (
    <div className={`ad-box-container ad-box-${position}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`ad-box ad-box-${position}`}>
          <div className="ad-box-content">
            <div className="ad-box-label">Advertisement</div>
            <div className="ad-box-placeholder">
              <p>200 x 600</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AdBox;


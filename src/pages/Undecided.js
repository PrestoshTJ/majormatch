import React, { useState } from 'react'
import './Undecided.css'
import majorStats from '../majorSimilarity'

function Undecided() {
  const [preferences, setPreferences] = useState({
    liberalArtsVsStem: 50,
    theoreticalVsPractical: 50,
    individualVsTeam: 50,
    creativeVsAnalytical: 50,
    researchVsApplied: 50
  });

  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSliderChange = (preference, value) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: parseInt(value)
    }));
  };

  const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] ** 2;
        magnitudeB += vecB[i] ** 2;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowResults(true);
  
    // Corrected user vector (0–1 scale, aligned with slider direction)
    const userVector = [
      preferences.liberalArtsVsStem / 100, // STEM preference
      preferences.theoreticalVsPractical / 100, // Practical preference
      preferences.individualVsTeam / 100, // Team preference
      preferences.creativeVsAnalytical / 100, // Analytical preference
      preferences.researchVsApplied / 100 // Applied preference
    ];
  
    const majorScores = majorStats.map(major => {
      const majorVector = [
        major.stem,
        major.practical,
        major.team,
        major.analytical,
        major.applied
      ];
  
      const similarity = cosineSimilarity(userVector, majorVector);
  
      return {
        major: major.major,
        score: similarity
      };
    });
  
    // Adjusted threshold to 0.8 for stricter matching
    const topRecommendations = majorScores
      .filter(rec => rec.score >= 0.8)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  
    setRecommendations(topRecommendations);
  };
  

  const surveyQuestions = [
    {
      id: 'liberalArtsVsStem',
      label: 'Liberal Arts vs STEM',
      left: 'Liberal Arts',
      right: 'STEM'
    },
    {
      id: 'theoreticalVsPractical',
      label: 'Theoretical vs Practical',
      left: 'Theoretical',
      right: 'Practical'
    },
    {
      id: 'individualVsTeam',
      label: 'Individual vs Team Work',
      left: 'Individual',
      right: 'Team'
    },
    {
      id: 'creativeVsAnalytical',
      label: 'Creative vs Analytical',
      left: 'Creative',
      right: 'Analytical'
    },
    {
      id: 'researchVsApplied',
      label: 'Research vs Applied',
      left: 'Research',
      right: 'Applied'
    }
  ];

  return (
    <div className="survey-container">
      <h1 className="survey-title">Major Preference Survey</h1>
      <p className="survey-description">
        Use the sliders below to indicate your preferences. The position of each slider
        represents where you stand between the two extremes.
      </p>
      
      <form onSubmit={handleSubmit}>
        {surveyQuestions.map(question => (
          <div key={question.id} className="slider-container">
            <div className="slider-label">
              <span>{question.left}</span>
              <span>{question.right}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={preferences[question.id]}
              onChange={(e) => handleSliderChange(question.id, e.target.value)}
              className="slider"
            />
            <div className="slider-extremes">
              <span>0%</span>
              <span>100%</span>
            </div>

            <div className="slider-value">
              <span>{preferences[question.id]}%</span>
            </div>
          </div>
        ))}
        
        <button type="submit" className="submit-button">
          Get Major Recommendations
        </button>
      </form>

      {showResults && (
        <div className="recommendations-container">
          <h2>Your Top Major Recommendations</h2>
          {recommendations.length > 0 ? (
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div key={rec.major} className="recommendation-item">
                  <span className="rank">{index + 1}</span>
                  <span className="major-name">{rec.major}</span>
                  <span className="match-score">{(rec.score * 100).toFixed(1)}% Match</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-recommendations">
              No majors matched your preferences closely enough. Try adjusting your preferences to get recommendations.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default Undecided
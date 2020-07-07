import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDonor: "",
      donors: [
        { name: "Magnum" },
        { name: "Carly" }
      ],
      recommendQuantity: 0,
      recommendedDonors: [
        { donor: "Carly", Score: 2.1 },
        { donor: "Magnum", Score: 2.2 }
      ]
    }
  }

  componentDidMount = () => {
    this.fetchDonors();
  }

  render = () => {

    const donorsDataList = this.state.donors.map((donor, index) => (
      <option key={index} value={donor.name} />
    ));

    const recommendedDonorsRows = this.state.recommendedDonors.map((donor, index) => (
      <tr key={index}>
        <td>{donor.donor}</td>
        <td>{donor.Score}</td>
      </tr>
    ));

    return (
      <div>
        <h1>Recommendation System Prototype</h1>
        <div>
          <label htmlFor="donors">Select Donor: </label>
          <input type="text" list="donors" name="selectedDonor" onChange={this.handleChange} />

          <datalist id="donors">
            {donorsDataList}
          </datalist>
          <label htmlFor="quantity">Quantity to recommend: </label>
          <input type="text" list="quantity" name="recommendQuantity" onChange={this.handleChange} />

          <datalist id="quantity">
            <option key="0" value="5" />
            <option key="1" value="15" />
            <option key="2" value="25" />
            <option key="3" value="35" />
          </datalist>
        </div>
        <div>
          <button onClick={this.fetchRecommendedDonors}>Recommend Donors {this.state.recommendQuantity} {this.state.selectedDonor === "" ? "" : `for ${this.state.selectedDonor}`}</button>
        </div>
        <div>
          <h1>Recommended Donors</h1>
          <table>
            <thead>
              <tr>
                <th>Donors</th>
                <th>Similarity Score</th>
              </tr>
            </thead>
            <tbody>
              {recommendedDonorsRows}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  fetchDonors = () => {
    fetch(`http://localhost:8080/api/v1/donors`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(res => {
        this.setState({
          donors: res
        });
      });
  };

  fetchRecommendedDonors = () => {
    fetch(`http://localhost:8080/api/v1/donors/${this.state.selectedDonor}/similarities/quantity/${this.state.recommendQuantity}`, {
      method: "GET"
    })
      .then(res => res.json())
      .then(res => {
        this.setState({
          recommendedDonors: res.donorsScores
        });
      });
  };

};

export default App;

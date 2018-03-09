import React, { Component } from 'react';
import './App.css';
import TemplatePreview from './TemplatePreview';
import PatternPreview from './PatternPreview';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      degree: 3,
      template: null,
    }
  }

  render() {
    let template = this.generateTemplate();
    return (
      <div className="App">
        <div>
          <label>degree</label>
          <input type="number" value={this.state.degree}
           onChange={(e) => {
             this.setState({degree: e.target.value});
           }}
          />
        </div>
        <hr/>
        <TemplatePreview template={template}/>
        <PatternPreview template={template}/>
      </div>
    );
  }

  generateTemplate() {
    let angle = 2 * Math.PI / this.state.degree;
    let width = 100;
    let height = (width / 2) / Math.tan(angle / 2);
    let trianglePoints = [
      [0, 0],
      [width / 2, height],
      [width, 0],
    ];
    let triangleSvg = (
      `<polygon
        points="${this.pointsToPointsStr(trianglePoints)}"
        style='fill: lime; stroke: blue;'
       ></polygon>
      `
    );
    return {
      def: `<g>${triangleSvg}</g>`,
      width,
      height,
      rotationPoint: [width / 2, height],
      degree: this.state.degree,
    };
  }


  pointsToPointsStr(points) {
    return points.map(p => p.join(',')).join(' ');
  }
}

export default App;

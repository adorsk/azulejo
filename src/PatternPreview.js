import React from 'react';


class Pattern extends React.Component {
  render() {
    let {template} = this.props;
    if (! template) {
      return null;
    }
    let svgStyle = {
      width: 400,
      height: 200,
      border: 'thin solid gray',
    };
    let hrefId = 'template'
    return (
      <div>
        <svg style={svgStyle}>
          <defs>
            <g id={hrefId} dangerouslySetInnerHTML={{__html: template.def}}/>
          </defs>
          {this.renderRotatedTemplates({hrefId})}
        </svg>
      </div>
    );
  }

  renderRotatedTemplates (opts) {
    let {hrefId} = opts;
    let {template} = this.props;
    let rotStr = template.rotationPoint.join(' ');
    let rotatedTemplates = [];
    let rotationAngle = 360 / template.degree;
    for (let i = 0; i < template.degree; i++) {
      let rotatedTemplate = (
        <use
        key={i}
        href={`#${hrefId}`}
        transform={`rotate(${i * rotationAngle} ${rotStr})`} />
      );
      rotatedTemplates.push(rotatedTemplate);
    }
    return rotatedTemplates;
  }
};

export default Pattern;

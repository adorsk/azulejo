import React from 'react';


class TemplatePreview extends React.Component {
  render() {
    let {template} = this.props;
    if (! template) {
      return (<div>no template</div>);
    }
    let svgStyle = {
      width: 400,
      height: 200,
      border: 'thin solid gray',
    };
    let padding = 10;
    return (
      <div>
        <svg style={svgStyle}>
          <svg x={padding} y={padding} width={svgStyle.width - 2 * padding}
              dangerouslySetInnerHTML={{__html: template.svg}} />
        </svg>
      </div>
    );
  }
}

export default TemplatePreview;

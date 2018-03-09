import React from 'react';


class TemplatePreview extends React.Component {
  render() {
    let {template} = this.props;
    if (! template) {
      return (<div>no template</div>);
    }
    let padding = 10;
    let viewBox = [
      -padding,
      -padding,
      template.width + 2 * padding,
      template.height  + 2 * padding,
    ];
    let svgStyle = {
      width: 400,
      height: 200,
      border: 'thin solid gray',
    };
    return (
      <div>
        <svg
          viewBox={`${viewBox.join(' ')}`} style={svgStyle}
          dangerouslySetInnerHTML={{__html: template.def}}
        />
      </div>
    );
  }
}

export default TemplatePreview;

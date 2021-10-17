import React from "react";

class ShowImage extends React.Component {
  constructor(props) {
    super(props);
    this.switchImage = this.switchImage.bind(this);
    this.state = {
      currentImage: 0,
      seconds: 0,
      imageStatus: "<img src={this.props.images[this.state.currentImage]}/>"
    };
  }

  switchImage() {
    if (this.state.currentImage == 0) {
      this.setState({
        currentImage: 1
      });
    } else {
      this.setState({
        currentImage: 0
      });
    }
    this.setState({seconds: this.state.seconds + 1});
    if(this.state.seconds > 7){
        clearInterval(this.timer);
    }
    return this.currentImage;
  }

  componentDidMount() {
        this.timer = setInterval(this.switchImage, 1000);     
  }

  componentWillUnmount(){
    clearInterval(this.timer);
  }

  handleImageLoaded() {
    this.setState({ imageStatus: "" });
  }

  render() {
    return (
      <div className="image_style">
        <img
          src={this.props.images[this.state.currentImage]}
          alt="Loading image..."
        />
      </div>
    );
  }
}
export default ShowImage;

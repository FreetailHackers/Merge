import React, { Component } from "react"; 

class Collapsible extends Component {
    constructor(props){
        super(props);
        this.state = {
            open: false
        }
        this.togglePanel = () => {
            this.setState({open: !this.state.open})
        };
    }

    componentDidUpdate(){
        
    }

    render() {
      return (
        <div>
            <div onClick={this.togglePanel} className='headerDatabase'>
                {this.props.title}
            </div>
            { this.state.open ? <div className='contentDatabase'> {this.props.children} </div> : null }
        </div>
      );
    }
  }

export default Collapsible;
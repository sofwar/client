define([
    'react',
    'components/GraphicsContainer',
    'components/ControlsSelector'
], function(
    React,
    GraphicsContainerClass,
    ControlsSelectorClass
) {
    var D = React.DOM;

    var GraphicsContainer =  React.createFactory(GraphicsContainerClass);
    var ControlsSelector = React.createFactory(ControlsSelectorClass);

    return React.createClass({
        displayName: 'Chart-Controls',

        propTypes: {
            isMobileOrSmall: React.PropTypes.bool.isRequired,
            controlsSize: React.PropTypes.string.isRequired
        },

        render: function () {

            var chartControl = D.div({ id: 'chart-container', className: this.props.controlsSize },
                    GraphicsContainer({
                        isMobileOrSmall: this.props.isMobileOrSmall,
                        controlsSize: this.props.controlsSize
                    })
                );
            var betControl = this.props.isMobileOrSmall ? D.div({ id: 'controls-container', className: this.props.controlsSize },
                    ControlsSelector({
                        isMobileOrSmall: this.props.isMobileOrSmall,
                        controlsSize: this.props.controlsSize
                    }) 
                ) : '';
            return D.div({ id: 'chart-controls-inner-container', className: this.props.controlsSize },
                chartControl,
                betControl
                //,
                /*D.div({ id: 'controls-container', className: this.props.controlsSize },
                    ControlsSelector({
                        isMobileOrSmall: this.props.isMobileOrSmall,
                        controlsSize: this.props.controlsSize
                    })
                )*/
            );
        }
    });
});

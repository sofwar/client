define([
    'react',
    'react-dom',
    'lodash',
    'components/ChromeBugHack',
    'components/GraphicDisplay',
    'components/TextDisplay',
    'components/BingoDisplay',
    'game-logic/GameEngineStore',
    'stores/GameSettingsStore'
], function(
    React,
    ReactDOM,
    _,
    ChromeBugHack,
    GraphicDisplayClass,
    TextDisplayClass,
    BingoDisplayClass,
    GameEngineStore,
    GameSettingsStore
) {

    var D = React.DOM;

    var GraphicDisplay = React.createFactory(GraphicDisplayClass);
    var TextDisplay = React.createFactory(TextDisplayClass);
    var BingoDisplay = React.createFactory(BingoDisplayClass);
    var ChromeBugHack = React.createFactory(ChromeBugHack);

    function getState() {
        return _.merge(
            _.pick(GameSettingsStore.getState(), ['graphMode', 'currentTheme']),
            _.pick(GameEngineStore, ['nyan', 'connectionState', 'maxWin', 'bingo','gameState']), {
                devicePixelRatio: window.devicePixelRatio || 1
            }
        );
    }

    return React.createClass({
        displayName: 'GraphicsContainer',

        propTypes: {
            isMobileOrSmall: React.PropTypes.bool.isRequired,
            controlsSize: React.PropTypes.string.isRequired
        },

        getInitialState: function() {
            var state = getState();
            state.width = 0;
            state.height = 0;
            return state;
        },

        resizeAnimReq: null,
        onWindowResize: function() {
            var self = this;
            self.resizeAnimRequest = window.requestAnimationFrame(function() {
                var domNode = ReactDOM.findDOMNode(self);
                console.log(domNode.clientWidth);
                self.setState(_.merge(getState(), {
                    width: domNode.clientWidth - 50,
                    height: domNode.clientHeight - 50
                }));
            });
        },

        componentDidMount: function() {
            GameEngineStore.on({
                joined: this._onChange,
                disconnected: this._onChange,
                game_started: this._onChange,
                game_crash: this._onChange,
                game_starting: this._onStarting, //this._onChange,
                lag_change: this._onChange,
                nyan_cat_animation: this._onNyanAnim,
                bingo_tick: this._onBingoTick,
               // bingo_starting: this._onBingoStarting

            });
            GameSettingsStore.addChangeListener(this._onChange);
            window.addEventListener('resize', this.onWindowResize);

            document.addEventListener('visibilitychange', this._onVisibilityChange);



            // Call the resize handler once to setup the initial geometry of the
            // canvas displays.
            this.onWindowResize();
        },

        componentWillUnmount: function() {
            GameEngineStore.off({
                joined: this._onChange,
                disconnected: this._onChange,
                game_started: this._onChange,
                game_crash: this._onChange,
                game_starting: this._onStarting, //this._onChange,
                lag_change: this._onChange,
                nyan_cat_animation: this._onNyanAnim,
                bingo_tick: this._onBingoTick,
            });
            GameSettingsStore.removeChangeListener(this._onChange);
            window.removeEventListener('resize', this.onWindowResize);
            window.cancelAnimationFrame(this.resizeAnimReq);

            document.removeEventListener('visibilitychange', this._onVisibilityChange);
        },

        _onChange: function() {
            if (this.isMounted())
                this.setState(getState());
        },

        _onBingoTick: function () {
            console.log('_onBingoTick');
            if (!this.state.bingo)
            {
                this.state.bingo = true;
                this.forceUpdate();
            }
        },

        _onBingoStarting: function () {
            if (this.isMounted())
                this.setState(getState());
        },

        _onVisibilityChange: function() {
            if (!this.isMounted()) return;

            this.setState({
                chromeHack: true
            });
        },

        _removeChromeHack: function() {
            if (!this.isMounted()) return;
            this.setState({
                chromeHack: false
            });
        },

        componentDidUpdate: function(prevProps, prevState) {
            // Detect changes on the controls size to trigger a window resize to
            // resize the canvas of the graphics display.
            if (this.props.controlsSize !== prevProps.controlsSize)
                this.onWindowResize();
        },

        _onNyanAnim: function() {
            this.setState({
                nyan: true
            });
        },

        render: function() {
            var display;

            console.log("bingo state: " + this.state.bingo); // .gameState);

            if (this.state.chromeHack)
                display = ChromeBugHack({
                    onMount: this._removeChromeHack
                });
            else if (this.state.graphMode === 'text')
                display = TextDisplay();
            else if (this.state.bingo)
                display = BingoDisplay();
            else
                display = GraphicDisplay(_.merge({
                        controlsSize: this.props.controlsSize
                    },
                    _.pick(this.state, [
                        'currentTheme',
                        'width',
                        'height',
                        'devicePixelRatio'
                    ])
                ));
            //Connection message
            var connectionMessage;
            switch (this.state.connectionState) {
                case 'CONNECTING':
                    connectionMessage = 'Connecting...';
                    break;
                case 'DISCONNECTED':
                    connectionMessage = 'Connection Lost ...';
                    break;
                default:
                    connectionMessage = null;
            }
            var maxProfit;
            if (this.state.bingo) {
                maxProfit = "";
            } else {
                maxProfit = D.div({
                        className: 'max-profit'
                    },
                    'Max profit: ', (this.state.maxWin / 1e8).toFixed(4), ' BTC'
                )
            }

            return D.div({
                    id: 'chart-inner-container',
                    className: this.props.controlsSize,
                    ref: 'container'
                },
                D.div({
                        className: 'anim-cont'
                    },
                    D.div({
                            className: 'nyan' + (this.state.nyan ? ' show' : '')
                        },
                        this.state.nyan ? D.img({
                            src: '/img/nyan.gif'
                        }) : null
                    )
                ),
                maxProfit,
                display,
                D.div({
                        className: 'connection-state'
                    },
                    connectionMessage
                )
            );
        }
    });
});

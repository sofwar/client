/**
 * This view acts as a wrapper for all the other views in the game
 * it is subscribed to changes in EngineVirtualStore but it only
 * listen to connection changes so every view should subscribe to
 * EngineVirtualStore independently.
 */
define([
    'react',
    'lib/idle-timer',
    'constants/AppConstants',
    'components/TopBar',
    'components/ChartControls',
    'components/TabsSelector',
    'components/Players',
    'components/BetBar',
    'components/ControlsSelector',
    'game-logic/clib',
    'game-logic/hotkeys',
    'game-logic/GameEngineStore',
    'stores/GameSettingsStore',
    'stores/StrategyEditorStore'
], function (
    React,
    IdleTimer,
    AppConstants,
    TopBarClass,
    ChartControlsClass,
    TabsSelectorClass,
    PlayersClass,
    BetBarClass,
    ControlsSelectorClass,
    Clib,
    Hotkeys,
    GameEngineStore,
    GameSettingsStore,
    StrategyEditorStore
) {
    var TopBar = React.createFactory(TopBarClass);
    var ChartControls = React.createFactory(ChartControlsClass);
    var TabsSelector = React.createFactory(TabsSelectorClass);
    var Players = React.createFactory(PlayersClass);
    var BetBar = React.createFactory(BetBarClass);
    var ControlsSelector = React.createFactory(ControlsSelectorClass);

    var D = React.DOM;

    return React.createClass({
        displayName: 'Game',

        getInitialState: function () {
            //console.log('getInitialState');
            var state = GameSettingsStore.getState();
            state.showMessage = true;
            state.isMobileOrSmall = Clib.isMobileOrSmall(); //bool
            //console.log(state);
            return state;
        },

        componentDidMount: function () {
            //console.log('componentDidMount');
            GameSettingsStore.addChangeListener(this._onSettingsChange);
            StrategyEditorStore.addChangeListener(this._onStrategyChange);

            window.addEventListener("resize", this._onWindowResize);
            this._idleTimer.register();
            this._idleTimer.on({
                idle: this._onIdle,
                unidle: this._onUnidle
            });

            Hotkeys.mount();
        },

        componentWillUnmount: function () {
            GameSettingsStore.removeChangeListener(this._onSettingsChange);
            StrategyEditorStore.removeChangeListener(this._onStrategyChange);

            window.removeEventListener("resize", this._onWindowResize);
            this._idleTimer.unregister();
            this._idleTimer.off({
                idle: this._onIdle,
                unidle: this._onUnidle
            });

            Hotkeys.unmount();
        },

        _onSettingsChange: function () {
            //console.log('_onSettingsChange');
            if (this.isMounted())
                this.setState(GameSettingsStore.getState());
        },

        _onWindowResize: function () {
            var isMobileOrSmall = Clib.isMobileOrSmall();
            if (this.state.isMobileOrSmall !== isMobileOrSmall)
                this.setState({
                    isMobileOrSmall: isMobileOrSmall
                });
        },

        _hideMessage: function () {
            this.setState({
                showMessage: false
            });
        },

        _onStrategyChange: function () {
            this._idleTimer.setState(!StrategyEditorStore.getEditorState());
        },

        _idleTimer: IdleTimer({
            timeout: AppConstants.Engine.IDLE_TIMEOUT
        }),
        _onIdle: function () {
            console.log('User became idle. Disconnecting..');
            GameEngineStore.ws.disconnect();
        },

        _onUnidle: function () {
            console.log('User became active. Reconnecting..');
            GameEngineStore.ws.connect();
        },

        _onRunScript: function () { },

        render: function () {

            var messageContainer;
            if (USER_MESSAGE && this.state.showMessage) {

                var messageContent, messageClass, containerClass = 'show-message';
                switch (USER_MESSAGE.type) {
                    case 'error':
                        messageContent = D.span(null,
                            D.span(null, USER_MESSAGE.text)
                        );
                        messageClass = 'error';
                        break;
                    case 'newUser':
                        messageContent = D.span(null,
                            D.a({
                                href: "/request"
                            }, "Welcome to bustabit.com, to start you can request 3 free bits or you  just watch the current games... have fun :D")
                        );
                        messageClass = 'new-user';
                        break;
                    case 'received':
                        messageContent = D.span(null,
                            D.span(null, "Congratulations you have been credited " + USER_MESSAGE.qty + " free bits. Have fun!")
                        );
                        messageClass = 'received';
                        break;
                    case 'advice':
                        messageContent = D.span(null,
                            D.span(null, USER_MESSAGE.advice)
                        );
                        messageClass = 'advice';
                        break;
                    case 'collect':
                        messageContent = D.span(null,
                            D.a({
                                href: '/request'
                            }, 'Collect your 3 free bits!')
                        );
                        messageClass = 'collect';
                        break;
                    default:
                        messageContent = null;
                        messageClass = 'hide';
                        containerClass = '';
                }

                messageContainer = D.div({
                    id: 'game-message-container',
                    className: messageClass
                },
                    messageContent,
                    D.a({
                        className: 'close-message',
                        onClick: this._hideMessage
                    }, D.i({
                        className: 'fa fa-times'
                    }))
                )
            } else {
                messageContainer = null;
                containerClass = '';
            }

            var rightContainer = !this.state.isMobileOrSmall ?
                D.div({
                    id: 'game-right-container'
                },
                    Players(),
                    BetBar()
                ) : null;

            var rightBottomContainer = !this.state.isMobileOrSmall ?
                D.div({
                    id: 'game-right-bottom-container'
                },
                    ControlsSelector({
                        isMobileOrSmall: this.state.isMobileOrSmall,
                        controlsSize: this.state.controlsSize
                    })
                ) : D.div({
                        id: 'bet-controls-row'
                },
                        D.div({
                            id: 'bet-controls-col'
                        },
                        ControlsSelector({
                            isMobileOrSmall: this.state.isMobileOrSmall,
                            controlsSize: this.state.controlsSize
                        })
                    )
                );

            return !this.state.isMobileOrSmall ? D.div({
                id: 'game-inner-container'
            },

                TopBar({
                    isMobileOrSmall: this.state.isMobileOrSmall
                }),

                messageContainer,

                D.div({
                    id: 'game-playable-container',
                    className: containerClass
                },

                    //Chat and Controls
                    D.div({
                        id: 'game-left-container',
                        className: this.state.isMobileOrSmall ? ' small-window' : ''
                    },
                        D.div({
                            id: 'chart-controls-row'
                        },
                            D.div({
                                id: 'chart-controls-col',
                                className: this.state.controlsSize
                            },
                                D.div({
                                    className: 'cell-wrapper'
                                },
                                    ChartControls({
                                        isMobileOrSmall: this.state.isMobileOrSmall,
                                        controlsSize: this.state.controlsSize
                                    })
                                )
                            )
                        ),

                        //Chat, History, etc...
                        D.div({
                            id: 'tabs-controls-row'
                        },
                            D.div({
                                id: 'tabs-controls-col'
                            },
                                D.div({
                                    className: 'cell-wrapper'
                                },
                                    TabsSelector({
                                        isMobileOrSmall: this.state.isMobileOrSmall,
                                        controlsSize: this.state.controlsSize
                                    })
                                )
                            )
                        )

                    ),

                    //Players
                    rightContainer,
                    // bet menu
                    rightBottomContainer
                )
            ) : D.div({
                id: 'game-inner-container'
            },

                TopBar({
                    isMobileOrSmall: this.state.isMobileOrSmall
                }),
                messageContainer,
                D.div({
                    id: 'game-playable-container',
                    className: containerClass
                },
                    D.div({
                        id: 'game-left-container',
                        className: 'small-window'
                    }, D.div({
                        id: 'chart-controls-row'
                    },
                            D.div({
                                id: 'chart-controls-col',
                                className: this.state.controlsSize
                            },
                                D.div({
                                    className: 'cell-wrapper'
                                },
                                    ChartControls({
                                        isMobileOrSmall: this.state.isMobileOrSmall,
                                        controlsSize: this.state.controlsSize
                                    })
                                )
                            )
                        ),
                    D.div({
                        id: 'tabs-controls-row'
                    },
                            D.div({
                                id: 'tabs-controls-col'
                            },
                                D.div({
                                    className: 'cell-wrapper'
                                },
                                    TabsSelector({
                                        isMobileOrSmall: this.state.isMobileOrSmall,
                                        controlsSize: this.state.controlsSize
                                    })
                                )
                            )
                        )
                    )
                )
            );
        }
    });

});

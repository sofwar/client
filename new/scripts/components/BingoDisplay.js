define([
            'react',
            'react-dom',
            'game-logic/clib',
            'game-logic/GameEngineStore',
            'game-logic/stateLib',
            'stores/GameSettingsStore'
], function (
            React,
            ReactDOM,
            Clib,
            Engine,
            StateLib,
            GameSettingsStore
        ) {
    var D = React.DOM;
    return React.createClass({
        displayName: 'BingoDisplay',
        showStatic: true,
        playersNumber: 0,
        players: null,
        prevPlayers: null,
        step: 0,
        getInitialState: function () {
            return {
                size: {
                    inProgress: '60px',
                    ended: '60px',
                    starting: '60px'
                },
                theme: GameSettingsStore.getCurrentTheme(),
                step: 1
            }
        },

        componentDidMount: function () {
            GameSettingsStore.addChangeListener(this._onChange);
            window.addEventListener("resize", this._calcTextValues);
            this._calcTextValues();

            var self = this;
            /*setTimeout(function() {
                self._update();
            }, REFRESH_TIME);*/

            Engine.on({
                /*joined: this._onChange,
                disconnected: this._onChange,*/
                game_started: this._onStarted,
                game_crash: this._onCrash,
                game_starting: this._onStarting,
                bingo_starting: this._onBingoStarting,
                bingo_started: this._onBingoStarted,
                bingo_win: this._onBingoWin
            });
        },

        componentWillUnmount: function () {
            GameSettingsStore.removeChangeListener(this._onChange);
            window.removeEventListener("resize", this._calcTextValues);
            Engine.off({
                /*joined: this._onChange,
                disconnected: this._onChange,*/
                game_started: this._onStarted,
                game_crash: this._onCrash,
                game_starting: this._onStarting, //this._onChange,
                bingo_starting: this._onBingoStarting,
                bingo_started: this._onBingoStarted,
                bingo_win: this._onBingoWin
            });
        },

        _onStarting: function (info) {
            /*console.log('################# DISPLAY ON STARTING');
            console.log(info);
            console.log(Engine.gameState);
            console.log('################# END DISPLAY ON STARTING');*/
            showStatic = false;
            this._onChange();
        },

        _onStarted: function () {
            /*   console.log('################# DISPLAY ON STD');
               console.log(Engine.gameState);
               console.log('################# END DISPLAY ON STD');*/
            this._onChange();
        },

        _onChange: function () {
            if (this.isMounted())
                this.setState({
                    theme: GameSettingsStore.getCurrentTheme()
                });
        },

        _calcTextValues: function () {
            var onePercent = ReactDOM.findDOMNode(this).clientWidth / 100;

            function fontSizePx(times) {
                var fontSize = onePercent * times;
                return fontSize.toFixed(2) + 'px';
            }

            this.setState({
                size: {
                    inProgress: fontSizePx(20),
                    ended: fontSizePx(15),
                    starting: fontSizePx(5)
                }
            });

        },

        _update: function () {
            var self = this;

            if (this.isMounted()) {
                this.forceUpdate();

                setTimeout(function () {
                    self._update();
                }, REFRESH_TIME);
            }
        },

        _onBingoStarting: function (info) {
            /* console.log('################################  BINGO STARTING ############################### ');
             console.log(info.step);
             console.log('');*/
            this.showStatic = false;
            this.state.step = info.step;
            this.forceUpdate();
        },

        _onBingoStarted: function (info) {
            /*console.log('%%%%%%  BINGO STARTING ^^^^ ');
            console.log(info.step + " - " + info.number);
            console.log('');*/
            this.showStatic = false;
            this.playersNumber = info.number;
            this.state.step = info.step;
            this.forceUpdate();
        },

        _onBingoWin: function (info) {
            /*console.log('____ BINGO WIN ____ ');
            console.log(info.step);
            console.log('');*/
            this.showStatic = false;
            this.state.step = info.step;
            this.players = info.winners;
            this.playersNumber = info.number;
            this.prevPlayers = info.prevWinners;
            this.forceUpdate();
        },

        render: function () {
            var content;
            var intContent;
            //console.log('Display render gameState =>' + Engine.gameState);
            //console.log('Display render this.state.step =>' + this.state.step);
            //console.log('Display render statuc =>' + this.showStatic);
            if (this.showStatic) {
                content = this.staticContent();
            } else {
                switch (this.state.step) {
                    case 1: //'STARTING':
                        content = this.startStaticContent();
                        /*content = D.div({
                            id: "bingo-static-container"
                        }, intContent);*/
                        break;
                    case 2:
                        console.log('players NUMBER: ' + this.playersNumber);
                        content = this.bingoPlay();
                        break;
                    case 3:
                        console.log('step 3 executed');
                        content = this.bingoResult();
                        break;
                    default:
                        content = this.staticContent();
                        break;
                }
            }

            return D.div({
                id: "bingo-display-container"
            },
                content
            );
        },

        startStaticContent: function () {
            return D.div({
                id: "bingo-static-container"
            }, D.audio({ id: 'intro-avb', autoPlay: true, src: "/sounds/bingo.mp3" }),
            D.div({ className: 'img-placeholder' }, D.img({ id: "intro-img", src: "/img/bingo_static.png" })),
            D.div({ className: 'result-placeholder' }, D.h1({ className: "h1-title" }, "Bingo game"))

                );
        },

        staticContent: function () {
            return D.div({
                id: "bingo-static-container"
            },
            D.div({ className: 'img-placeholder' }, D.img({ id: "intro-img", src: "/img/bingo_static.png" })),
            D.div({ className: 'result-placeholder' }, D.h1({ className: "h1-title" }, "Bingo game is playing..."))

                );
        },

        bingoPlay: function () {
            return D.div({
                id: "bingo-starting-container"
            },

            D.div({ className: 'img-placeholder' }, D.video({
                id: 'video-ctrl', autoPlay: "autoplay", src: "/movies/vid_" + this.playersNumber + "_s.mp4"
            })),
            D.div({ className: 'result-placeholder' }, D.h1({ className: "h1-title" }, "bingo game"))

                );
        },

        bingoResult: function () {
            return D.div({
                id: "bingo-starting-container"
            },
                D.div({ className: 'img-placeholder' },
                D.img({ id: "intro-img", src: "/img/bingo_" + this.playersNumber + ".png" })),
                this.winnersList()
            );
        },

        winnersList: function () {

            var winners = [];
            for (var i = 0; i < this.players.length; i++) {
                winners.push(D.li({ className: "winner-item" },
                    D.span({}, "No." + this.players[i].user_id),
                    D.span({}, this.players[i].username),
                    D.span({}, this.players[i].amount.toLocaleString('en-US', { minimumFractionDigits: 0 }) + " bits")
                    ));
            }
            var prevWinners = [];
            for (var i = 0; i < this.prevPlayers.length; i++) {
                //prevWinners.push(D.li({ className: "winner-item" },
                //  D.span({}, "No." + this.prevPlayers[i].user_id),
                //  D.span({className: 'prev'}, this.prevPlayers[i].username)//,
                // D.span({}, this.prevPlayers[i].amount.toLocaleString('en-US', { minimumFractionDigits: 0 }) + " bits")
                var endComma = i + 1 == this.prevPlayers.length ? "" : ", ";
                prevWinners.push(D.span({ className: 'prev' }, this.prevPlayers[i].username + endComma));//,
                //));
            }
            //console.log('result list: ' + indents.join(""));
            console.log(this.prevPlayers);
            return D.div({ className: "result-placeholder" },
                D.div({ className: 'result-container fadeIn animated' },
                D.h1({ className: "h1-result-title" }, "bingo game"),
                D.h2({ className: "winners-header" }, "winners"),
                D.ul({ className: "winners-list" }, winners),
                D.h2({ className: "prev-winners-header" }, "Previous winners"),
                D.div({ className: "winners-list" }, prevWinners)
                )
            );

        },

        /*        prevWinnersList: function () {
        
                
                    console.log('result list: ' + indents.join(""));
                console.log(prevPlayers);
                return D.div({ className: "result-placeholder" },
                    D.div({ className: 'result-container' },
                    D.h1({ className: "h1-result-title" }, "bingo game"),
                    D.h2({ className: "prev-winners-header" }, "winners"),
                    D.ul({ className: "winners-list" }, winners))
                );
        
        }
        */

    });
})

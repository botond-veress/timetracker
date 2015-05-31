define(['services/datacontext', 'moment', 'models/controls/inlineTextControl'],
    function (datacontext, moment, inlineTextControl) {

        function day(options) {

            options = options || {};
            var self = this;

            self.date = assignVariable(options.date || Date.now);
            self.date.day = ko.computed(function () {
                return moment(self.date()).date();
            });
            self.date.weekday = ko.computed(function () {
                return moment(self.date()).format('dddd');
            });
            self.filled = assignVariable(options.filled || false);
            self.current = assignVariable(options.current || false);
            self.selected = assignVariable(options.selected || false);
            self.active = assignVariable(options.active || false);
            self.muted = assignVariable(options.muted || false);
            self.disabled = assignVariable(options.disabled || false);

        }

        function project(options) {

            options = options || {};
            var self = this;

            self.id = ko.observable(options.id);
            self.client = ko.observable(options.client || 'Unknown client');
            self.name = ko.observable(options.name || 'Unknown project');
            self.message = ko.observable(options.message || null);
            self.hours = ko.observable(options.hours);
            self.hours.temp = ko.observable(self.hours());
            self.overtime = ko.observable(options.overtime);
            self.overtime.temp = ko.observable(self.overtime());

            self.areWorkHoursShown = ko.observable();

            self.toggleWorkHours = function () {
                self.areWorkHoursShown(!self.areWorkHoursShown());
            };

            self.saveWorkHours = function () {
                var hours = Math.min(+self.hours.temp(), 24);
                var overtime = Math.min(+self.overtime.temp(), 24);
                self.hours(hours);
                self.overtime(Math.min(overtime, 24 - hours));
                self.toggleWorkHours();
            };

        }

        function timeproject(options) {

            options = options || {};
            options.days = options.days || [];
            var self = this;

            self.name = options.name || 'Project undefined';
            self.days = assignArrayVariable(options.days.map(function (current) {
                return new day(current);
            }));

        }

        function timeclient(options) {

            options = options || {};
            options.projects = options.projects || [];
            options.days = options.days || [];

            var self = this;

            self.name = options.name || 'Client undefined';
            self.background = options.background || 'transparent';
            self.color = options.color || 'inherit';
            self.projects = assignArrayVariable(options.projects.map(function (project) {
                project.days = options.days;
                //.filter(function (day) {
                //    return day.project == project.id;
                //});
                return new timeproject(project);
            }));

        }

        function timesheet(options) {

            options = options || {};
            options.clients = options.clients || [];
            options.projects = options.projects || [];
            var self = this;

            self.sessions = ko.observableArray([new session(options.session)]);
            self.current = ko.observable(self.sessions()[0]);

            self.days = ko.computed(function () {
                var start = moment(self.current().start());
                var end = moment(self.current().end());
                var difference = end.diff(start, 'days');
                var days = [];
                for (var index = 0; index < difference; ++index) {
                    var day = moment(start).add(index, 'days');
                    days.push({
                        date: day.date(),
                        display: day.format('ddd'),
                        weekend: day.day() < 6
                    });
                }
                return days;
            });

            self.clients = assignArrayVariable(options.clients.map(function (client) {
                client.projects = options.projects.filter(function (project) {
                    return project.id == client.id;
                });
                client.days = self.days();
                return new timeclient(client);
            }));

            self.calendar = new calendar();

            function calendar(options) {

                options = options || {};
                options.weekstart = options.weekstart || 1;
                var self = this;

                var current = ko.observable(Date.now());
                self.current = ko.computed(function () {
                    return moment(current()).startOf('month').toDate();
                });
                self.current.month = ko.computed(function () {
                    return moment(self.current()).format('MMMM');
                });
                self.current.year = ko.computed(function () {
                    return moment(self.current()).format('YYYY');
                });
                self.previous = ko.computed(function () {
                    return moment(self.current()).subtract('1', 'months').toDate().getTime();
                });
                self.previous.month = ko.computed(function () {
                    return moment(self.previous()).format('MMMM');
                });
                self.next = ko.computed(function () {
                    return moment(self.current()).add('1', 'months').toDate().getTime();
                });
                self.next.month = ko.computed(function () {
                    return moment(self.next()).format('MMMM');
                });
                self.weekstart = ko.computed(function () {
                    return moment(self.current()).startOf('week').add(Math.min(options.weekstart, 1), 'days').toDate();
                });
                self.weekdays = ko.computed(function () {
                    var weekstart = moment(self.weekstart());
                    var weekdays = [];
                    for (var index = 0; index < 7; ++index) {
                        weekdays.push(moment(weekstart).add(index, 'days').format('ddd'));
                    }
                    return weekdays;
                });
                self.projects = ko.observableArray();
                self.projects.loading = ko.observable(true);
                self.projects.total = ko.computed(function () {
                    return self.projects().reduce(function (current, next) {
                        return current + (next.hours() || 0) + (next.overtime() || 0);
                    }, 0);
                });
                self.selected = ko.observable();
                self.selected.safe = ko.computed(function () {
                    if (this()) {
                        this.__safe = this()
                    }
                    return this.__safe;
                }, self.selected);
                self.selected.safe.subscribe(function (value) {
                    self.projects.loading(true);
                    setTimeout(function () {
                        self.projects([
                            new project({ client: 'Jet', name: 'Partner Portal', hours: 8, overtime: 3, message: 'Some random message' }),
                            new project({ client: 'TriggerMail', name: 'Templating', hours: 2 }),
                            new project({ client: 'Maurice Lacroix', name: 'ML', message: 'Some random and very-very long message and I am bored' }),
                        ]);
                        self.projects.loading(false);
                    }, 10);
                });
                self.selected.internal = ko.observable(false);
                self.selected.overlay = ko.computed({
                    read: function () {
                        return self.projects().some(function (current) {
                            return current.areWorkHoursShown();
                        });
                    },
                    deferEvaluation: true
                });
                self.days = ko.computed(function () {
                    var days = [];

                    var now = moment(Date.now()).startOf('day').toDate();
                    var current = moment(self.current());
                    var count = moment(current).endOf('month').date();
                    var weekday = moment(current).weekday() - Math.min(options.weekstart, 1);

                    for (var index = 0; index < weekday; ++index) {
                        (function (i) {
                            var date = moment(current).subtract(weekday - i, 'days').toDate();
                            days.push(new day({
                                date: date,
                                muted: true,
                                filled: Math.abs(now - date) < 1000 * 60 * 60 * 24 * 10 && i % 3 == 0,
                                selected: ko.computed(function () {
                                    var selected = self.selected();
                                    return selected && daysEqual(selected.date(), date);
                                })
                            }));
                        })(index);
                    }

                    for (var index = 0; index < count; ++index) {
                        (function (i) {
                            var date = moment(current).add(index, 'days').toDate();
                            days.push(new day({
                                current: date.getTime() == now.getTime(),
                                date: date,
                                filled: Math.abs(now - date) < 1000 * 60 * 60 * 24 * 10 && i % 3 == 0,
                                selected: ko.computed(function () {
                                    var selected = self.selected();
                                    return selected && daysEqual(selected.date(), date);
                                })
                            }));
                        })(index);
                    }

                    for (var index = 0; days.length < 42; ++index) {
                        (function (i) {
                            var date = moment(current).add(1, 'months').add(index, 'days').toDate();
                            days.push(new day({
                                date: date,
                                muted: true,
                                filled: Math.abs(now - date) < 1000 * 60 * 60 * 24 * 10 && i % 3 == 0,
                                selected: ko.computed(function () {
                                    var selected = self.selected();
                                    return selected && daysEqual(selected.date(), date);
                                })
                            }));
                        })(index);
                    }

                    return days;
                });

                self.select = function (day) {
                    var date = moment(day.date());
                    var days = self.days();
                    self.selected(self.selected() != day ? day : null);
                };

                self.select(self.days()[10]);

                self.deselect = function () {
                    self.selected(null);
                };

                self.selectPreviousMonth = function () {
                    current(self.previous());
                };

                self.selectNextMonth = function () {
                    current(self.next());
                };

                self.previousDay = function (day) {
                    var date = moment(day.date()).subtract(1, 'days');
                    if (date.month() < moment(self.current()).month()) {
                        current(date.toDate());
                    }
                    selectDayByDate(date.toDate());
                };

                self.nextDay = function (day) {
                    var date = moment(day.date()).add(1, 'days');
                    if (date.month() > moment(self.current()).month()) {
                        current(date.toDate());
                    }
                    selectDayByDate(date.toDate());
                };

                function daysEqual(a, b) {
                    return a.getTime() == b.getTime()
                }

                function selectDayByDate(date) {
                    var days = self.days();
                    for (var index = 0; index < days.length; ++index) {
                        if (daysEqual(days[index].date(), date)) {
                            selectInstant(days[index]);
                            break;
                        }
                    }
                }

                function selectInstant(day) {
                    if (self.selected.__timeout) {
                        clearTimeout(self.selected.__timeout);
                    }
                    self.selected.internal(true);
                    self.select(day);
                    self.selected.__timeout = setTimeout(function () {
                        self.selected.internal(false);
                    }, 500);
                }

            }

        }

        function session(options) {

            options = options || {};
            var self = this;

            self.start = assignVariable(options.start || Date.now());
            self.end = assignVariable(options.end || Date.now());
            self.display = ko.computed(function () {
                return moment(self.start()).format('MMM DD. YYYY') + ' - ' + moment(self.end()).format('MMM DD. YYYY');
            });

        }

        var entity = ko.observable();

        function activate() {
            var session = null;
            var clients = [];
            var projects = [];
            var days = [];
            return datacontext.time.getCurrentSession().then(function (data) {
                session = data;
                return datacontext.time.getClients();
            })
            .then(function (data) {
                clients = data;
                return datacontext.time.getProjects();
            })
            .then(function (data) {
                projects = data;
                return datacontext.time.getDays();
            })
            .then(function (data) {
                days = data;
            })
            .always(function () {
                entity(new timesheet({
                    session: session,
                    clients: clients,
                    projects: projects,
                    days: days
                }));
            });
        }

        var vm = {
            activate: activate,
            entity: entity
        };

        return vm;
    }
);
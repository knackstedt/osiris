export const Grammar = {
    "scopeName": "source.log",
    "name": "Log",
    "fileTypes": [
        "log",
        "syslog",
        "out",
        "output"
    ],
    "firstLineMatch": "((\\d{1,3}.\\d{1,3}.\\d{1,3}.\\d{1,3}|localhost|::1) - - )?((([A-Z][a-z]{2}\\s\\s?){1,2})|(^[0-9]{2}:?)|(^\\[)|((?!\\b)\\[[0-9]{2}\\/))([A-Z][a-z]{2} [A-Z][a-z]{2} .{1})?([0-9]{2}?\\/?[A-Z][a-z]{2})?[0-9./-]+ ?([A-Z][a-z]{2} [0-9]{4} )?[0-9T.:\\/+Z]+(,[0-9]{3})?( 20[0-9]{2}( :|\\]))?( [A-Z]{3,4}\\])?((\\]| [-+][0-9]{4}\\]))?",
    "patterns": [
        {
            "include": "#general"
        },
        {
            "include": "#timestamps"
        },
        {
            "include": "#python"
        },
        {
            "include": "#android"
        },
        {
            "include": "#ios"
        },
        {
            "include": "#fastlane"
        },
        {
            "include": "#idea"
        },
        {
            "include": "#syslog"
        },
        {
            "include": "#apache"
        },
        {
            "include": "#nabto"
        },
        {
            "include": "#adobe"
        },
        {
            "include": "#google"
        },
        {
            "include": "#apple"
        },
        {
            "include": "#cbs"
        },
        {
            "include": "#jboss"
        },
        {
            "include": "#npm"
        }
    ],
    "repository": {
        "general": {
            "patterns": [
                {
                    "match": "[\\s\\[=](/[^ ,>]+)",
                    "captures": {
                        "1": {
                            "name": "keyword.log.path"
                        }
                    }
                },
                {
                    "match": "\\b([A-Za-z]{1}:)?\\\\[\\\\\\w.\\-$]+",
                    "name": "keyword.log.path.win"
                },
                {
                    "match": "\\b[a-z-]+://[^,)\\s]+",
                    "name": "keyword.log.url"
                },
                {
                    "match": "[“\"].*?[\"”]",
                    "name": "log.string.double"
                },
                {
                    "match": "'.*?'",
                    "name": "log.string.single"
                },
                {
                    "match": "^#.*",
                    "name": "definition.log.comment.line.number-sign"
                },
                {
                    "match": "\\bv(.?)[0-9]+.[0-9]+[0-9.]*\\b",
                    "name": "keyword.log.version"
                },
                {
                    "match": "\\bversion [0-9]+.[0-9]+[0-9.]*\\b",
                    "name": "keyword.log.version"
                },
                {
                    "match": "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(:[0-9]{2,5})?",
                    "name": "keyword.log.ip"
                },
                {
                    "match": "<?\\w+([-+.']\\w+)*@\\w+([-.]\\w+)*\\.\\w+([-.]\\w+)*?>",
                    "name": "log.string.mail"
                },
                {
                    "match": "<[a-z][a-z0-9]+>",
                    "name": "definition.log.function.support.mark"
                }
            ]
        },
        "timestamps": {
            "patterns": [
                {
                    "match": "^\\[[0-9]+\\.[0-9]+\\]",
                    "name": "definition.comment.timestamp.log"
                },
                {
                    "match": "((([A-Z][a-z]{2}\\s\\s?){1,2})|(^[0-9]{2}:?)|(^\\[)|((?!\\b)\\[[0-9]{2}\\/))([A-Z][a-z]{2} [A-Z][a-z]{2} .{1})?([0-9]{2}?\\/?[A-Z][a-z]{2})?[0-9./-]+ ?([A-Z][a-z]{2} [0-9]{4} )?[0-9T.:\\/+Z]+(,[0-9]{3})?( 20[0-9]{2}( :|\\]))?( [A-Z]{3,4}\\])?((\\]| [-+][0-9]{4}\\]))?",
                    "name": "definition.comment.timestamp.log"
                }
            ]
        },
        "python": {
            "patterns": [
                {
                    "match": "^(DEBUG|NOTSET)",
                    "name": "definition.log.log-debug"
                },
                {
                    "match": "^INFO",
                    "name": "definition.log.log-info"
                },
                {
                    "match": "^(WARNING|WARN)",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": "^(ERROR|CRITICAL)",
                    "name": "definition.log.log-error"
                },
                {
                    "match": ":([a-zA-Z0-9._]+):",
                    "captures": {
                        "1": {
                            "name": "definition.log.function.support.process"
                        }
                    }
                }
            ]
        },
        "android": {
            "patterns": [
                {
                    "match": "[A|E|F]/.*?[﹕|:]",
                    "name": "definition.log.log-error"
                },
                {
                    "match": " +[0-9-]+ +[0-9-]+ ([A|E|F] .*?[﹕|:])",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-error"
                        }
                    }
                },
                {
                    "match": "W/.*?[﹕|:]",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": " +[0-9-]+ +[0-9-]+ (W .*?[﹕|:])",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-warning"
                        }
                    }
                },
                {
                    "match": "D/.*?[﹕|:]",
                    "name": "definition.log.log-debug"
                },
                {
                    "match": " +[0-9-]+ +[0-9-]+ (D .*?[﹕|:])",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-debug"
                        }
                    }
                },
                {
                    "match": "I/.*?[﹕|:]",
                    "name": "definition.log.log-info"
                },
                {
                    "match": " +[0-9-]+ +[0-9-]+ (I .*?[﹕|:])",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-info"
                        }
                    }
                },
                {
                    "match": "V/.*?[﹕|:]",
                    "name": "definition.log.log-verbose"
                },
                {
                    "match": " +[0-9-]+ +[0-9-]+ (V .*?[﹕|:])",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-verbose"
                        }
                    }
                },
                {
                    "match": ".* GC_FOR_ALLOC .*",
                    "name": "definition.log.log-verbose"
                },
                {
                    "match": "\\([a-zA-Z:]+[^ ]*:[0-9]+\\)$",
                    "name": "definition.log.string.location"
                }
            ]
        },
        "ios": {
            "patterns": [
                {
                    "match": "^[A-Z]+[a-zA-Z0-9/ ]*?:",
                    "name": "definition.log.log-verbose"
                },
                {
                    "match": "[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}",
                    "name": "keyword.log.serial"
                }
            ]
        },
        "fastlane": {
            "patterns": [
                {
                    "match": "\\[[0-9]{2}:[0-9]{2}:[0-9]{2}\\]",
                    "name": "variable.log.fastlane.time"
                }
            ]
        },
        "idea": {
            "patterns": [
                {
                    "match": "\\[[0-9 ]*\\].*ERROR(?= )",
                    "name": "definition.log.log-error"
                },
                {
                    "match": "\\[[0-9 ]*\\].*WARN(?= )",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": "\\[[0-9 ]*\\].*INFO(?= )",
                    "name": "definition.log.log-info"
                }
            ]
        },
        "syslog": {
            "patterns": [
                {
                    "match": "\\[[a-zA-Z]+ [0-9]+ [^ ]*\\]",
                    "name": "definition.log.log-info"
                },
                {
                    "match": "\\b([a-z]+) ([a-zA-Z_-]+)\\[[0-9]+\\]:",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-verbose.user"
                        },
                        "2": {
                            "name": "definition.log.function.support.process"
                        }
                    }
                }
            ]
        },
        "apache": {
            "patterns": [
                {
                    "match": "\\b([4|5][0-9]{2}) [0-9]*$",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-failed"
                        }
                    }
                },
                {
                    "match": "\\b([2|3]0[0-9]{1}) [0-9]*$",
                    "captures": {
                        "1": {
                            "name": "definition.log.log-success"
                        }
                    }
                },
                {
                    "match": "(?i)\\[error\\]",
                    "name": "definition.log.log-error"
                },
                {
                    "match": "(?i)\\[warn\\]",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": "(?i)\\[debug\\]",
                    "name": "definition.log.log-debug"
                },
                {
                    "match": "(?i)\\[patch\\]",
                    "name": "definition.log.log-patch"
                },
                {
                    "match": "(?i)\\[info\\]",
                    "name": "definition.log.log-info"
                },
                {
                    "match": "(?i)\\[notice\\]",
                    "name": "definition.log.log-verbose"
                }
            ]
        },
        "nabto": {
            "patterns": [
                {
                    "match": "{00[0-9a-f]+}",
                    "name": "definition.log.comment.location"
                },
                {
                    "match": "\\[[A-Z_]+,(fatal|error)[^:]*",
                    "name": "definition.log.log-error"
                },
                {
                    "match": "\\[[A-Z_]+,warn[^:]*",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": "\\[[A-Z_]+,info[^:]*",
                    "name": "definition.log.log-info"
                },
                {
                    "match": "\\[[A-Z_]+,debug[^:]*",
                    "name": "definition.log.log-debug"
                },
                {
                    "match": "\\[[A-Z_]+,(trace|thrd)[^:]*",
                    "name": "definition.log.log-verbose"
                }
            ]
        },
        "adobe": {
            "patterns": [
                {
                    "match": "[\\*|=]{8,}",
                    "name": "definition.comment.separator"
                },
                {
                    "begin": "<CommandLineArguments>",
                    "end": "</CommandLineArguments>",
                    "name": "entity.name.tag"
                }
            ]
        },
        "google": {
            "patterns": [
                {
                    "match": "\\[lvl=3\\]",
                    "name": "definition.log.log-error"
                },
                {
                    "match": "\\[lvl=2\\]",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": "\\[lvl=1\\]",
                    "name": "definition.log.log-info"
                }
            ]
        },
        "apple": {
            "patterns": [
                {
                    "match": "(<?)\\b(Error|ERROR|Critical|CRITICAL)\\b(>?)",
                    "name": "definition.log.log-error"
                },
                {
                    "match": "(<?)\\b(Warning|WARNING)\\b(>?)",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": "(<?)\\b(Info|INFO)\\b(>?)",
                    "name": "definition.log.log-info"
                },
                {
                    "match": "(<?)\\b(Debug|DEBUG|DBG-X)\\b(>?)",
                    "name": "definition.log.log-debug"
                },
                {
                    "match": "(<?)\\b(Verbose|VERBOSE)\\b(>?)",
                    "name": "definition.log.log-verbose"
                },
                {
                    "match": "\\b[0-1].[0-9]+%",
                    "name": "constant.numeric.log"
                }
            ]
        },
        "cbs": {
            "patterns": [
                {
                    "match": "\\s{4,}(CBS)\\b",
                    "name": "constant.log.cbs"
                },
                {
                    "match": "\\s{4,}(CSI|DPX)\\b",
                    "name": "entity.log.csi"
                },
                {
                    "match": "\\s{4,}(DISM)\\b",
                    "name": "variable.log.dism"
                },
                {
                    "match": "[0-9-]{10} [0-9:.]{12}",
                    "name": "definition.comment.timestamp.log.inline"
                }
            ]
        },
        "jboss": {
            "patterns": [
                {
                    "match": "\\b(ERROR|FATAL)\\b",
                    "name": "definition.log.log-error"
                },
                {
                    "match": "\\bWARN\\b",
                    "name": "definition.log.log-warning"
                },
                {
                    "match": "\\bINFO\\b",
                    "name": "definition.log.log-info"
                },
                {
                    "match": "\\bDEBUG\\b",
                    "name": "definition.log.log-debug"
                },
                {
                    "match": "\\bTRACE\\b",
                    "name": "definition.log.log-verbose"
                }
            ]
        },
        "npm": {
            "patterns": [
                {
                    "match": "^(\\d+) (error) ",
                    "captures": {
                        "1": {
                            "name": "comment.block.log.index"
                        },
                        "2": {
                            "name": "definition.log.log-error"
                        }
                    }
                },
                {
                    "match": "^(\\d+) (warn) ",
                    "captures": {
                        "1": {
                            "name": "comment.block.log.index"
                        },
                        "2": {
                            "name": "definition.log.log-warning"
                        }
                    }
                },
                {
                    "match": "^(\\d+) (debug) ",
                    "captures": {
                        "1": {
                            "name": "comment.block.log.index"
                        },
                        "2": {
                            "name": "definition.log.log-debug"
                        }
                    }
                },
                {
                    "match": "^(\\d+) (info|http) ",
                    "captures": {
                        "1": {
                            "name": "comment.block.log.index"
                        },
                        "2": {
                            "name": "definition.log.log-info"
                        }
                    }
                },
                {
                    "match": "^(\\d+) (verbose|silly) ",
                    "captures": {
                        "1": {
                            "name": "comment.block.log.index"
                        },
                        "2": {
                            "name": "definition.log.log-verbose"
                        }
                    }
                }
            ]
        }
    }
};

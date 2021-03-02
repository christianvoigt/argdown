/**
 * Viz.js unreleased-a2b6215f58631f7ca03ec07d2cd9ad5871a7d4ed (Graphviz 2.44.1, Expat 2.2.9, Emscripten 1.39.20)
 * @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt MIT licensed
 *
 * This distribution contains other software in object code form:
 * - [Emscripten](https://github.com/emscripten-core/emscripten/blob/master/LICENSE)
 * - [Expat](https://github.com/libexpat/libexpat/blob/master/expat/COPYING)
 * - [Graphviz](https://graphviz.org/license/)
 */
var r = function(r) {
  var n, e;
  (r = void 0 !== (r = r || {}) ? r : {}).ready = new Promise(function(r, t) {
    (n = r), (e = t);
  });
  var t,
    o = {};
  for (t in r) r.hasOwnProperty(t) && (o[t] = r[t]);
  var i,
    a,
    u = "./this.program",
    s = function(r, n) {
      throw n;
    },
    c = "";
  (c =
    0 !== (c = self.location.href).indexOf("blob:")
      ? c.substr(0, c.lastIndexOf("/") + 1)
      : ""),
    (i = function(r) {
      var n = new XMLHttpRequest();
      return n.open("GET", r, !1), n.send(null), n.responseText;
    }),
    (a = function(r) {
      var n = new XMLHttpRequest();
      return (
        n.open("GET", r, !1),
        (n.responseType = "arraybuffer"),
        n.send(null),
        new Uint8Array(n.response)
      );
    });
  var l = r.print || console.log.bind(console),
    f = r.printErr || console.warn.bind(console);
  for (t in o) o.hasOwnProperty(t) && (r[t] = o[t]);
  (o = null),
    r.arguments && r.arguments,
    r.thisProgram && (u = r.thisProgram),
    r.quit && (s = r.quit);
  var d,
    m,
    p,
    h = 0;
  r.wasmBinary && (d = r.wasmBinary),
    r.noExitRuntime && (m = r.noExitRuntime),
    "object" != typeof WebAssembly && er("no native wasm support detected");
  var v = new WebAssembly.Table({
      initial: 991,
      maximum: 991,
      element: "anyfunc"
    }),
    y = !1;
  function g(r, n) {
    r || er("Assertion failed: " + n);
  }
  var w = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0;
  function E(r, n, e) {
    for (var t = n + e, o = n; r[o] && !(o >= t); ) ++o;
    if (o - n > 16 && r.subarray && w) return w.decode(r.subarray(n, o));
    for (var i = ""; n < o; ) {
      var a = r[n++];
      if (128 & a) {
        var u = 63 & r[n++];
        if (192 != (224 & a)) {
          var s = 63 & r[n++];
          if (
            (a =
              224 == (240 & a)
                ? ((15 & a) << 12) | (u << 6) | s
                : ((7 & a) << 18) | (u << 12) | (s << 6) | (63 & r[n++])) <
            65536
          )
            i += String.fromCharCode(a);
          else {
            var c = a - 65536;
            i += String.fromCharCode(55296 | (c >> 10), 56320 | (1023 & c));
          }
        } else i += String.fromCharCode(((31 & a) << 6) | u);
      } else i += String.fromCharCode(a);
    }
    return i;
  }
  function _(r, n) {
    return r ? E(C, r, n) : "";
  }
  function k(r, n, e, t) {
    if (!(t > 0)) return 0;
    for (var o = e, i = e + t - 1, a = 0; a < r.length; ++a) {
      var u = r.charCodeAt(a);
      if (
        (u >= 55296 &&
          u <= 57343 &&
          (u = (65536 + ((1023 & u) << 10)) | (1023 & r.charCodeAt(++a))),
        u <= 127)
      ) {
        if (e >= i) break;
        n[e++] = u;
      } else if (u <= 2047) {
        if (e + 1 >= i) break;
        (n[e++] = 192 | (u >> 6)), (n[e++] = 128 | (63 & u));
      } else if (u <= 65535) {
        if (e + 2 >= i) break;
        (n[e++] = 224 | (u >> 12)),
          (n[e++] = 128 | ((u >> 6) & 63)),
          (n[e++] = 128 | (63 & u));
      } else {
        if (e + 3 >= i) break;
        (n[e++] = 240 | (u >> 18)),
          (n[e++] = 128 | ((u >> 12) & 63)),
          (n[e++] = 128 | ((u >> 6) & 63)),
          (n[e++] = 128 | (63 & u));
      }
    }
    return (n[e] = 0), e - o;
  }
  function b(r, n, e) {
    return k(r, C, n, e);
  }
  function D(r) {
    for (var n = 0, e = 0; e < r.length; ++e) {
      var t = r.charCodeAt(e);
      t >= 55296 &&
        t <= 57343 &&
        (t = (65536 + ((1023 & t) << 10)) | (1023 & r.charCodeAt(++e))),
        t <= 127 ? ++n : (n += t <= 2047 ? 2 : t <= 65535 ? 3 : 4);
    }
    return n;
  }
  var F,
    S,
    C,
    P,
    A,
    T,
    M,
    x,
    j,
    R = "undefined" == typeof TextDecoder && void 0;
  function O(r, n) {
    for (var e = r, t = e >> 1, o = t + n / 2; !(t >= o) && A[t]; ) ++t;
    if ((e = t << 1) - r > 32 && R) return R.decode(C.subarray(r, e));
    for (var i = 0, a = ""; ; ) {
      var u = P[(r + 2 * i) >> 1];
      if (0 == u || i == n / 2) return a;
      ++i, (a += String.fromCharCode(u));
    }
  }
  function z(r, n, e) {
    if ((void 0 === e && (e = 2147483647), e < 2)) return 0;
    for (
      var t = n, o = (e -= 2) < 2 * r.length ? e / 2 : r.length, i = 0;
      i < o;
      ++i
    ) {
      var a = r.charCodeAt(i);
      (P[n >> 1] = a), (n += 2);
    }
    return (P[n >> 1] = 0), n - t;
  }
  function N(r) {
    return 2 * r.length;
  }
  function B(r, n) {
    for (var e = 0, t = ""; !(e >= n / 4); ) {
      var o = T[(r + 4 * e) >> 2];
      if (0 == o) break;
      if ((++e, o >= 65536)) {
        var i = o - 65536;
        t += String.fromCharCode(55296 | (i >> 10), 56320 | (1023 & i));
      } else t += String.fromCharCode(o);
    }
    return t;
  }
  function I(r, n, e) {
    if ((void 0 === e && (e = 2147483647), e < 4)) return 0;
    for (var t = n, o = t + e - 4, i = 0; i < r.length; ++i) {
      var a = r.charCodeAt(i);
      if (
        (a >= 55296 &&
          a <= 57343 &&
          (a = (65536 + ((1023 & a) << 10)) | (1023 & r.charCodeAt(++i))),
        (T[n >> 2] = a),
        (n += 4) + 4 > o)
      )
        break;
    }
    return (T[n >> 2] = 0), n - t;
  }
  function W(r) {
    for (var n = 0, e = 0; e < r.length; ++e) {
      var t = r.charCodeAt(e);
      t >= 55296 && t <= 57343 && ++e, (n += 4);
    }
    return n;
  }
  function L(n) {
    (F = n),
      (r.HEAP8 = S = new Int8Array(n)),
      (r.HEAP16 = P = new Int16Array(n)),
      (r.HEAP32 = T = new Int32Array(n)),
      (r.HEAPU8 = C = new Uint8Array(n)),
      (r.HEAPU16 = A = new Uint16Array(n)),
      (r.HEAPU32 = M = new Uint32Array(n)),
      (r.HEAPF32 = x = new Float32Array(n)),
      (r.HEAPF64 = j = new Float64Array(n));
  }
  var U = r.INITIAL_MEMORY || 16777216;
  function H(n) {
    for (; n.length > 0; ) {
      var e = n.shift();
      if ("function" != typeof e) {
        var t = e.func;
        "number" == typeof t
          ? void 0 === e.arg
            ? r.dynCall_v(t)
            : r.dynCall_vi(t, e.arg)
          : t(void 0 === e.arg ? null : e.arg);
      } else e(r);
    }
  }
  (p = r.wasmMemory
    ? r.wasmMemory
    : new WebAssembly.Memory({ initial: U / 65536, maximum: 32768 })) &&
    (F = p.buffer),
    (U = F.byteLength),
    L(F),
    (T[57808] = 5474272);
  var Y = [],
    q = [],
    V = [],
    X = [],
    G = Math.abs,
    K = Math.ceil,
    J = Math.floor,
    Z = Math.min,
    $ = 0,
    Q = null;
  function rr(n) {
    $++, r.monitorRunDependencies && r.monitorRunDependencies($);
  }
  function nr(n) {
    if (
      ($--,
      r.monitorRunDependencies && r.monitorRunDependencies($),
      0 == $ && Q)
    ) {
      var e = Q;
      (Q = null), e();
    }
  }
  function er(n) {
    r.onAbort && r.onAbort(n),
      f((n += "")),
      (y = !0),
      (n = "abort(" + n + "). Build with -s ASSERTIONS=1 for more info.");
    var t = new WebAssembly.RuntimeError(n);
    throw (e(t), t);
  }
  function tr(r) {
    return (
      (n = r),
      (e = "data:application/octet-stream;base64,"),
      String.prototype.startsWith ? n.startsWith(e) : 0 === n.indexOf(e)
    );
    var n, e;
  }
  (r.preloadedImages = {}), (r.preloadedAudios = {});
  var or,
    ir,
    ar,
    ur = "render.wasm";
  function sr() {
    try {
      if (d) return new Uint8Array(d);
      if (a) return a(ur);
      throw "both async and sync fetching of the wasm failed";
    } catch (r) {
      er(r);
    }
  }
  tr(ur) || ((or = ur), (ur = r.locateFile ? r.locateFile(or, c) : c + or));
  var cr,
    lr = {
      1025: function(r, n) {
        var e = _(r),
          t = _(n);
        yr.createPath("/", mr.dirname(e)), yr.writeFile(mr.join("/", e), t);
      }
    };
  function fr() {
    var n = (function() {
      var r = new Error();
      if (!r.stack) {
        try {
          throw new Error();
        } catch (n) {
          r = n;
        }
        if (!r.stack) return "(no stack trace available)";
      }
      return r.stack.toString();
    })();
    return (
      r.extraStackTrace && (n += "\n" + r.extraStackTrace()),
      n.replace(/\b_Z[\w\d_]+/g, function(r) {
        return r == r ? r : r + " [" + r + "]";
      })
    );
  }
  function dr(r) {
    return (T[un() >> 2] = r), r;
  }
  q.push({
    func: function() {
      tn();
    }
  }),
    (cr = function() {
      return performance.now();
    });
  var mr = {
      splitPath: function(r) {
        return /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/
          .exec(r)
          .slice(1);
      },
      normalizeArray: function(r, n) {
        for (var e = 0, t = r.length - 1; t >= 0; t--) {
          var o = r[t];
          "." === o
            ? r.splice(t, 1)
            : ".." === o
            ? (r.splice(t, 1), e++)
            : e && (r.splice(t, 1), e--);
        }
        if (n) for (; e; e--) r.unshift("..");
        return r;
      },
      normalize: function(r) {
        var n = "/" === r.charAt(0),
          e = "/" === r.substr(-1);
        return (
          (r = mr
            .normalizeArray(
              r.split("/").filter(function(r) {
                return !!r;
              }),
              !n
            )
            .join("/")) ||
            n ||
            (r = "."),
          r && e && (r += "/"),
          (n ? "/" : "") + r
        );
      },
      dirname: function(r) {
        var n = mr.splitPath(r),
          e = n[0],
          t = n[1];
        return e || t ? (t && (t = t.substr(0, t.length - 1)), e + t) : ".";
      },
      basename: function(r) {
        if ("/" === r) return "/";
        var n = r.lastIndexOf("/");
        return -1 === n ? r : r.substr(n + 1);
      },
      extname: function(r) {
        return mr.splitPath(r)[3];
      },
      join: function() {
        var r = Array.prototype.slice.call(arguments, 0);
        return mr.normalize(r.join("/"));
      },
      join2: function(r, n) {
        return mr.normalize(r + "/" + n);
      }
    },
    pr = {
      resolve: function() {
        for (var r = "", n = !1, e = arguments.length - 1; e >= -1 && !n; e--) {
          var t = e >= 0 ? arguments[e] : yr.cwd();
          if ("string" != typeof t)
            throw new TypeError("Arguments to path.resolve must be strings");
          if (!t) return "";
          (r = t + "/" + r), (n = "/" === t.charAt(0));
        }
        return (
          (n ? "/" : "") +
            (r = mr
              .normalizeArray(
                r.split("/").filter(function(r) {
                  return !!r;
                }),
                !n
              )
              .join("/")) || "."
        );
      },
      relative: function(r, n) {
        function e(r) {
          for (var n = 0; n < r.length && "" === r[n]; n++);
          for (var e = r.length - 1; e >= 0 && "" === r[e]; e--);
          return n > e ? [] : r.slice(n, e - n + 1);
        }
        (r = pr.resolve(r).substr(1)), (n = pr.resolve(n).substr(1));
        for (
          var t = e(r.split("/")),
            o = e(n.split("/")),
            i = Math.min(t.length, o.length),
            a = i,
            u = 0;
          u < i;
          u++
        )
          if (t[u] !== o[u]) {
            a = u;
            break;
          }
        var s = [];
        for (u = a; u < t.length; u++) s.push("..");
        return (s = s.concat(o.slice(a))).join("/");
      }
    },
    hr = {
      ttys: [],
      init: function() {},
      shutdown: function() {},
      register: function(r, n) {
        (hr.ttys[r] = { input: [], output: [], ops: n }),
          yr.registerDevice(r, hr.stream_ops);
      },
      stream_ops: {
        open: function(r) {
          var n = hr.ttys[r.node.rdev];
          if (!n) throw new yr.ErrnoError(43);
          (r.tty = n), (r.seekable = !1);
        },
        close: function(r) {
          r.tty.ops.flush(r.tty);
        },
        flush: function(r) {
          r.tty.ops.flush(r.tty);
        },
        read: function(r, n, e, t, o) {
          if (!r.tty || !r.tty.ops.get_char) throw new yr.ErrnoError(60);
          for (var i = 0, a = 0; a < t; a++) {
            var u;
            try {
              u = r.tty.ops.get_char(r.tty);
            } catch (r) {
              throw new yr.ErrnoError(29);
            }
            if (void 0 === u && 0 === i) throw new yr.ErrnoError(6);
            if (null == u) break;
            i++, (n[e + a] = u);
          }
          return i && (r.node.timestamp = Date.now()), i;
        },
        write: function(r, n, e, t, o) {
          if (!r.tty || !r.tty.ops.put_char) throw new yr.ErrnoError(60);
          try {
            for (var i = 0; i < t; i++) r.tty.ops.put_char(r.tty, n[e + i]);
          } catch (r) {
            throw new yr.ErrnoError(29);
          }
          return t && (r.node.timestamp = Date.now()), i;
        }
      },
      default_tty_ops: {
        get_char: function(r) {
          if (!r.input.length) {
            var n = null;
            if (
              ("undefined" != typeof window &&
              "function" == typeof window.prompt
                ? null !== (n = window.prompt("Input: ")) && (n += "\n")
                : "function" == typeof readline &&
                  null !== (n = readline()) &&
                  (n += "\n"),
              !n)
            )
              return null;
            r.input = rn(n, !0);
          }
          return r.input.shift();
        },
        put_char: function(r, n) {
          null === n || 10 === n
            ? (l(E(r.output, 0)), (r.output = []))
            : 0 != n && r.output.push(n);
        },
        flush: function(r) {
          r.output &&
            r.output.length > 0 &&
            (l(E(r.output, 0)), (r.output = []));
        }
      },
      default_tty1_ops: {
        put_char: function(r, n) {
          null === n || 10 === n
            ? (f(E(r.output, 0)), (r.output = []))
            : 0 != n && r.output.push(n);
        },
        flush: function(r) {
          r.output &&
            r.output.length > 0 &&
            (f(E(r.output, 0)), (r.output = []));
        }
      }
    },
    vr = {
      ops_table: null,
      mount: function(r) {
        return vr.createNode(null, "/", 16895, 0);
      },
      createNode: function(r, n, e, t) {
        if (yr.isBlkdev(e) || yr.isFIFO(e)) throw new yr.ErrnoError(63);
        vr.ops_table ||
          (vr.ops_table = {
            dir: {
              node: {
                getattr: vr.node_ops.getattr,
                setattr: vr.node_ops.setattr,
                lookup: vr.node_ops.lookup,
                mknod: vr.node_ops.mknod,
                rename: vr.node_ops.rename,
                unlink: vr.node_ops.unlink,
                rmdir: vr.node_ops.rmdir,
                readdir: vr.node_ops.readdir,
                symlink: vr.node_ops.symlink
              },
              stream: { llseek: vr.stream_ops.llseek }
            },
            file: {
              node: {
                getattr: vr.node_ops.getattr,
                setattr: vr.node_ops.setattr
              },
              stream: {
                llseek: vr.stream_ops.llseek,
                read: vr.stream_ops.read,
                write: vr.stream_ops.write,
                allocate: vr.stream_ops.allocate,
                mmap: vr.stream_ops.mmap,
                msync: vr.stream_ops.msync
              }
            },
            link: {
              node: {
                getattr: vr.node_ops.getattr,
                setattr: vr.node_ops.setattr,
                readlink: vr.node_ops.readlink
              },
              stream: {}
            },
            chrdev: {
              node: {
                getattr: vr.node_ops.getattr,
                setattr: vr.node_ops.setattr
              },
              stream: yr.chrdev_stream_ops
            }
          });
        var o = yr.createNode(r, n, e, t);
        return (
          yr.isDir(o.mode)
            ? ((o.node_ops = vr.ops_table.dir.node),
              (o.stream_ops = vr.ops_table.dir.stream),
              (o.contents = {}))
            : yr.isFile(o.mode)
            ? ((o.node_ops = vr.ops_table.file.node),
              (o.stream_ops = vr.ops_table.file.stream),
              (o.usedBytes = 0),
              (o.contents = null))
            : yr.isLink(o.mode)
            ? ((o.node_ops = vr.ops_table.link.node),
              (o.stream_ops = vr.ops_table.link.stream))
            : yr.isChrdev(o.mode) &&
              ((o.node_ops = vr.ops_table.chrdev.node),
              (o.stream_ops = vr.ops_table.chrdev.stream)),
          (o.timestamp = Date.now()),
          r && (r.contents[n] = o),
          o
        );
      },
      getFileDataAsRegularArray: function(r) {
        if (r.contents && r.contents.subarray) {
          for (var n = [], e = 0; e < r.usedBytes; ++e) n.push(r.contents[e]);
          return n;
        }
        return r.contents;
      },
      getFileDataAsTypedArray: function(r) {
        return r.contents
          ? r.contents.subarray
            ? r.contents.subarray(0, r.usedBytes)
            : new Uint8Array(r.contents)
          : new Uint8Array(0);
      },
      expandFileStorage: function(r, n) {
        var e = r.contents ? r.contents.length : 0;
        if (!(e >= n)) {
          (n = Math.max(n, (e * (e < 1048576 ? 2 : 1.125)) >>> 0)),
            0 != e && (n = Math.max(n, 256));
          var t = r.contents;
          (r.contents = new Uint8Array(n)),
            r.usedBytes > 0 && r.contents.set(t.subarray(0, r.usedBytes), 0);
        }
      },
      resizeFileStorage: function(r, n) {
        if (r.usedBytes != n) {
          if (0 == n) return (r.contents = null), void (r.usedBytes = 0);
          if (!r.contents || r.contents.subarray) {
            var e = r.contents;
            return (
              (r.contents = new Uint8Array(n)),
              e && r.contents.set(e.subarray(0, Math.min(n, r.usedBytes))),
              void (r.usedBytes = n)
            );
          }
          if ((r.contents || (r.contents = []), r.contents.length > n))
            r.contents.length = n;
          else for (; r.contents.length < n; ) r.contents.push(0);
          r.usedBytes = n;
        }
      },
      node_ops: {
        getattr: function(r) {
          var n = {};
          return (
            (n.dev = yr.isChrdev(r.mode) ? r.id : 1),
            (n.ino = r.id),
            (n.mode = r.mode),
            (n.nlink = 1),
            (n.uid = 0),
            (n.gid = 0),
            (n.rdev = r.rdev),
            yr.isDir(r.mode)
              ? (n.size = 4096)
              : yr.isFile(r.mode)
              ? (n.size = r.usedBytes)
              : yr.isLink(r.mode)
              ? (n.size = r.link.length)
              : (n.size = 0),
            (n.atime = new Date(r.timestamp)),
            (n.mtime = new Date(r.timestamp)),
            (n.ctime = new Date(r.timestamp)),
            (n.blksize = 4096),
            (n.blocks = Math.ceil(n.size / n.blksize)),
            n
          );
        },
        setattr: function(r, n) {
          void 0 !== n.mode && (r.mode = n.mode),
            void 0 !== n.timestamp && (r.timestamp = n.timestamp),
            void 0 !== n.size && vr.resizeFileStorage(r, n.size);
        },
        lookup: function(r, n) {
          throw yr.genericErrors[44];
        },
        mknod: function(r, n, e, t) {
          return vr.createNode(r, n, e, t);
        },
        rename: function(r, n, e) {
          if (yr.isDir(r.mode)) {
            var t;
            try {
              t = yr.lookupNode(n, e);
            } catch (r) {}
            if (t) for (var o in t.contents) throw new yr.ErrnoError(55);
          }
          delete r.parent.contents[r.name],
            (r.name = e),
            (n.contents[e] = r),
            (r.parent = n);
        },
        unlink: function(r, n) {
          delete r.contents[n];
        },
        rmdir: function(r, n) {
          var e = yr.lookupNode(r, n);
          for (var t in e.contents) throw new yr.ErrnoError(55);
          delete r.contents[n];
        },
        readdir: function(r) {
          var n = [".", ".."];
          for (var e in r.contents) r.contents.hasOwnProperty(e) && n.push(e);
          return n;
        },
        symlink: function(r, n, e) {
          var t = vr.createNode(r, n, 41471, 0);
          return (t.link = e), t;
        },
        readlink: function(r) {
          if (!yr.isLink(r.mode)) throw new yr.ErrnoError(28);
          return r.link;
        }
      },
      stream_ops: {
        read: function(r, n, e, t, o) {
          var i = r.node.contents;
          if (o >= r.node.usedBytes) return 0;
          var a = Math.min(r.node.usedBytes - o, t);
          if (a > 8 && i.subarray) n.set(i.subarray(o, o + a), e);
          else for (var u = 0; u < a; u++) n[e + u] = i[o + u];
          return a;
        },
        write: function(r, n, e, t, o, i) {
          if ((n.buffer === S.buffer && (i = !1), !t)) return 0;
          var a = r.node;
          if (
            ((a.timestamp = Date.now()),
            n.subarray && (!a.contents || a.contents.subarray))
          ) {
            if (i)
              return (a.contents = n.subarray(e, e + t)), (a.usedBytes = t), t;
            if (0 === a.usedBytes && 0 === o)
              return (a.contents = n.slice(e, e + t)), (a.usedBytes = t), t;
            if (o + t <= a.usedBytes)
              return a.contents.set(n.subarray(e, e + t), o), t;
          }
          if (
            (vr.expandFileStorage(a, o + t), a.contents.subarray && n.subarray)
          )
            a.contents.set(n.subarray(e, e + t), o);
          else for (var u = 0; u < t; u++) a.contents[o + u] = n[e + u];
          return (a.usedBytes = Math.max(a.usedBytes, o + t)), t;
        },
        llseek: function(r, n, e) {
          var t = n;
          if (
            (1 === e
              ? (t += r.position)
              : 2 === e && yr.isFile(r.node.mode) && (t += r.node.usedBytes),
            t < 0)
          )
            throw new yr.ErrnoError(28);
          return t;
        },
        allocate: function(r, n, e) {
          vr.expandFileStorage(r.node, n + e),
            (r.node.usedBytes = Math.max(r.node.usedBytes, n + e));
        },
        mmap: function(r, n, e, t, o, i) {
          if ((g(0 === n), !yr.isFile(r.node.mode)))
            throw new yr.ErrnoError(43);
          var a,
            u,
            s = r.node.contents;
          if (2 & i || s.buffer !== F) {
            if (
              ((t > 0 || t + e < s.length) &&
                (s = s.subarray
                  ? s.subarray(t, t + e)
                  : Array.prototype.slice.call(s, t, t + e)),
              (u = !0),
              !(a = yr.mmapAlloc(e)))
            )
              throw new yr.ErrnoError(48);
            S.set(s, a);
          } else (u = !1), (a = s.byteOffset);
          return { ptr: a, allocated: u };
        },
        msync: function(r, n, e, t, o) {
          if (!yr.isFile(r.node.mode)) throw new yr.ErrnoError(43);
          return 2 & o || vr.stream_ops.write(r, n, 0, t, e, !1), 0;
        }
      }
    },
    yr = {
      root: null,
      mounts: [],
      devices: {},
      streams: [],
      nextInode: 1,
      nameTable: null,
      currentPath: "/",
      initialized: !1,
      ignorePermissions: !0,
      trackingDelegate: {},
      tracking: { openFlags: { READ: 1, WRITE: 2 } },
      ErrnoError: null,
      genericErrors: {},
      filesystems: null,
      syncFSRequests: 0,
      handleFSError: function(r) {
        if (!(r instanceof yr.ErrnoError)) throw r + " : " + fr();
        return dr(r.errno);
      },
      lookupPath: function(r, n) {
        if (((n = n || {}), !(r = pr.resolve(yr.cwd(), r))))
          return { path: "", node: null };
        var e = { follow_mount: !0, recurse_count: 0 };
        for (var t in e) void 0 === n[t] && (n[t] = e[t]);
        if (n.recurse_count > 8) throw new yr.ErrnoError(32);
        for (
          var o = mr.normalizeArray(
              r.split("/").filter(function(r) {
                return !!r;
              }),
              !1
            ),
            i = yr.root,
            a = "/",
            u = 0;
          u < o.length;
          u++
        ) {
          var s = u === o.length - 1;
          if (s && n.parent) break;
          if (
            ((i = yr.lookupNode(i, o[u])),
            (a = mr.join2(a, o[u])),
            yr.isMountpoint(i) &&
              (!s || (s && n.follow_mount)) &&
              (i = i.mounted.root),
            !s || n.follow)
          )
            for (var c = 0; yr.isLink(i.mode); ) {
              var l = yr.readlink(a);
              if (
                ((a = pr.resolve(mr.dirname(a), l)),
                (i = yr.lookupPath(a, { recurse_count: n.recurse_count }).node),
                c++ > 40)
              )
                throw new yr.ErrnoError(32);
            }
        }
        return { path: a, node: i };
      },
      getPath: function(r) {
        for (var n; ; ) {
          if (yr.isRoot(r)) {
            var e = r.mount.mountpoint;
            return n ? ("/" !== e[e.length - 1] ? e + "/" + n : e + n) : e;
          }
          (n = n ? r.name + "/" + n : r.name), (r = r.parent);
        }
      },
      hashName: function(r, n) {
        for (var e = 0, t = 0; t < n.length; t++)
          e = ((e << 5) - e + n.charCodeAt(t)) | 0;
        return ((r + e) >>> 0) % yr.nameTable.length;
      },
      hashAddNode: function(r) {
        var n = yr.hashName(r.parent.id, r.name);
        (r.name_next = yr.nameTable[n]), (yr.nameTable[n] = r);
      },
      hashRemoveNode: function(r) {
        var n = yr.hashName(r.parent.id, r.name);
        if (yr.nameTable[n] === r) yr.nameTable[n] = r.name_next;
        else
          for (var e = yr.nameTable[n]; e; ) {
            if (e.name_next === r) {
              e.name_next = r.name_next;
              break;
            }
            e = e.name_next;
          }
      },
      lookupNode: function(r, n) {
        var e = yr.mayLookup(r);
        if (e) throw new yr.ErrnoError(e, r);
        for (
          var t = yr.hashName(r.id, n), o = yr.nameTable[t];
          o;
          o = o.name_next
        ) {
          var i = o.name;
          if (o.parent.id === r.id && i === n) return o;
        }
        return yr.lookup(r, n);
      },
      createNode: function(r, n, e, t) {
        var o = new yr.FSNode(r, n, e, t);
        return yr.hashAddNode(o), o;
      },
      destroyNode: function(r) {
        yr.hashRemoveNode(r);
      },
      isRoot: function(r) {
        return r === r.parent;
      },
      isMountpoint: function(r) {
        return !!r.mounted;
      },
      isFile: function(r) {
        return 32768 == (61440 & r);
      },
      isDir: function(r) {
        return 16384 == (61440 & r);
      },
      isLink: function(r) {
        return 40960 == (61440 & r);
      },
      isChrdev: function(r) {
        return 8192 == (61440 & r);
      },
      isBlkdev: function(r) {
        return 24576 == (61440 & r);
      },
      isFIFO: function(r) {
        return 4096 == (61440 & r);
      },
      isSocket: function(r) {
        return 49152 == (49152 & r);
      },
      flagModes: {
        r: 0,
        rs: 1052672,
        "r+": 2,
        w: 577,
        wx: 705,
        xw: 705,
        "w+": 578,
        "wx+": 706,
        "xw+": 706,
        a: 1089,
        ax: 1217,
        xa: 1217,
        "a+": 1090,
        "ax+": 1218,
        "xa+": 1218
      },
      modeStringToFlags: function(r) {
        var n = yr.flagModes[r];
        if (void 0 === n) throw new Error("Unknown file open mode: " + r);
        return n;
      },
      flagsToPermissionString: function(r) {
        var n = ["r", "w", "rw"][3 & r];
        return 512 & r && (n += "w"), n;
      },
      nodePermissions: function(r, n) {
        return yr.ignorePermissions ||
          ((-1 === n.indexOf("r") || 292 & r.mode) &&
            (-1 === n.indexOf("w") || 146 & r.mode) &&
            (-1 === n.indexOf("x") || 73 & r.mode))
          ? 0
          : 2;
      },
      mayLookup: function(r) {
        var n = yr.nodePermissions(r, "x");
        return n || (r.node_ops.lookup ? 0 : 2);
      },
      mayCreate: function(r, n) {
        try {
          return yr.lookupNode(r, n), 20;
        } catch (r) {}
        return yr.nodePermissions(r, "wx");
      },
      mayDelete: function(r, n, e) {
        var t;
        try {
          t = yr.lookupNode(r, n);
        } catch (r) {
          return r.errno;
        }
        var o = yr.nodePermissions(r, "wx");
        if (o) return o;
        if (e) {
          if (!yr.isDir(t.mode)) return 54;
          if (yr.isRoot(t) || yr.getPath(t) === yr.cwd()) return 10;
        } else if (yr.isDir(t.mode)) return 31;
        return 0;
      },
      mayOpen: function(r, n) {
        return r
          ? yr.isLink(r.mode)
            ? 32
            : yr.isDir(r.mode) &&
              ("r" !== yr.flagsToPermissionString(n) || 512 & n)
            ? 31
            : yr.nodePermissions(r, yr.flagsToPermissionString(n))
          : 44;
      },
      MAX_OPEN_FDS: 4096,
      nextfd: function(r, n) {
        (r = r || 0), (n = n || yr.MAX_OPEN_FDS);
        for (var e = r; e <= n; e++) if (!yr.streams[e]) return e;
        throw new yr.ErrnoError(33);
      },
      getStream: function(r) {
        return yr.streams[r];
      },
      createStream: function(r, n, e) {
        yr.FSStream ||
          ((yr.FSStream = function() {}),
          (yr.FSStream.prototype = {
            object: {
              get: function() {
                return this.node;
              },
              set: function(r) {
                this.node = r;
              }
            },
            isRead: {
              get: function() {
                return 1 != (2097155 & this.flags);
              }
            },
            isWrite: {
              get: function() {
                return 0 != (2097155 & this.flags);
              }
            },
            isAppend: {
              get: function() {
                return 1024 & this.flags;
              }
            }
          }));
        var t = new yr.FSStream();
        for (var o in r) t[o] = r[o];
        r = t;
        var i = yr.nextfd(n, e);
        return (r.fd = i), (yr.streams[i] = r), r;
      },
      closeStream: function(r) {
        yr.streams[r] = null;
      },
      chrdev_stream_ops: {
        open: function(r) {
          var n = yr.getDevice(r.node.rdev);
          (r.stream_ops = n.stream_ops),
            r.stream_ops.open && r.stream_ops.open(r);
        },
        llseek: function() {
          throw new yr.ErrnoError(70);
        }
      },
      major: function(r) {
        return r >> 8;
      },
      minor: function(r) {
        return 255 & r;
      },
      makedev: function(r, n) {
        return (r << 8) | n;
      },
      registerDevice: function(r, n) {
        yr.devices[r] = { stream_ops: n };
      },
      getDevice: function(r) {
        return yr.devices[r];
      },
      getMounts: function(r) {
        for (var n = [], e = [r]; e.length; ) {
          var t = e.pop();
          n.push(t), e.push.apply(e, t.mounts);
        }
        return n;
      },
      syncfs: function(r, n) {
        "function" == typeof r && ((n = r), (r = !1)),
          yr.syncFSRequests++,
          yr.syncFSRequests > 1 &&
            f(
              "warning: " +
                yr.syncFSRequests +
                " FS.syncfs operations in flight at once, probably just doing extra work"
            );
        var e = yr.getMounts(yr.root.mount),
          t = 0;
        function o(r) {
          return yr.syncFSRequests--, n(r);
        }
        function i(r) {
          if (r) return i.errored ? void 0 : ((i.errored = !0), o(r));
          ++t >= e.length && o(null);
        }
        e.forEach(function(n) {
          if (!n.type.syncfs) return i(null);
          n.type.syncfs(n, r, i);
        });
      },
      mount: function(r, n, e) {
        var t,
          o = "/" === e,
          i = !e;
        if (o && yr.root) throw new yr.ErrnoError(10);
        if (!o && !i) {
          var a = yr.lookupPath(e, { follow_mount: !1 });
          if (((e = a.path), (t = a.node), yr.isMountpoint(t)))
            throw new yr.ErrnoError(10);
          if (!yr.isDir(t.mode)) throw new yr.ErrnoError(54);
        }
        var u = { type: r, opts: n, mountpoint: e, mounts: [] },
          s = r.mount(u);
        return (
          (s.mount = u),
          (u.root = s),
          o
            ? (yr.root = s)
            : t && ((t.mounted = u), t.mount && t.mount.mounts.push(u)),
          s
        );
      },
      unmount: function(r) {
        var n = yr.lookupPath(r, { follow_mount: !1 });
        if (!yr.isMountpoint(n.node)) throw new yr.ErrnoError(28);
        var e = n.node,
          t = e.mounted,
          o = yr.getMounts(t);
        Object.keys(yr.nameTable).forEach(function(r) {
          for (var n = yr.nameTable[r]; n; ) {
            var e = n.name_next;
            -1 !== o.indexOf(n.mount) && yr.destroyNode(n), (n = e);
          }
        }),
          (e.mounted = null);
        var i = e.mount.mounts.indexOf(t);
        e.mount.mounts.splice(i, 1);
      },
      lookup: function(r, n) {
        return r.node_ops.lookup(r, n);
      },
      mknod: function(r, n, e) {
        var t = yr.lookupPath(r, { parent: !0 }).node,
          o = mr.basename(r);
        if (!o || "." === o || ".." === o) throw new yr.ErrnoError(28);
        var i = yr.mayCreate(t, o);
        if (i) throw new yr.ErrnoError(i);
        if (!t.node_ops.mknod) throw new yr.ErrnoError(63);
        return t.node_ops.mknod(t, o, n, e);
      },
      create: function(r, n) {
        return (
          (n = void 0 !== n ? n : 438),
          (n &= 4095),
          (n |= 32768),
          yr.mknod(r, n, 0)
        );
      },
      mkdir: function(r, n) {
        return (
          (n = void 0 !== n ? n : 511),
          (n &= 1023),
          (n |= 16384),
          yr.mknod(r, n, 0)
        );
      },
      mkdirTree: function(r, n) {
        for (var e = r.split("/"), t = "", o = 0; o < e.length; ++o)
          if (e[o]) {
            t += "/" + e[o];
            try {
              yr.mkdir(t, n);
            } catch (r) {
              if (20 != r.errno) throw r;
            }
          }
      },
      mkdev: function(r, n, e) {
        return (
          void 0 === e && ((e = n), (n = 438)), (n |= 8192), yr.mknod(r, n, e)
        );
      },
      symlink: function(r, n) {
        if (!pr.resolve(r)) throw new yr.ErrnoError(44);
        var e = yr.lookupPath(n, { parent: !0 }).node;
        if (!e) throw new yr.ErrnoError(44);
        var t = mr.basename(n),
          o = yr.mayCreate(e, t);
        if (o) throw new yr.ErrnoError(o);
        if (!e.node_ops.symlink) throw new yr.ErrnoError(63);
        return e.node_ops.symlink(e, t, r);
      },
      rename: function(r, n) {
        var e,
          t,
          o = mr.dirname(r),
          i = mr.dirname(n),
          a = mr.basename(r),
          u = mr.basename(n);
        try {
          (e = yr.lookupPath(r, { parent: !0 }).node),
            (t = yr.lookupPath(n, { parent: !0 }).node);
        } catch (r) {
          throw new yr.ErrnoError(10);
        }
        if (!e || !t) throw new yr.ErrnoError(44);
        if (e.mount !== t.mount) throw new yr.ErrnoError(75);
        var s,
          c = yr.lookupNode(e, a),
          l = pr.relative(r, i);
        if ("." !== l.charAt(0)) throw new yr.ErrnoError(28);
        if ("." !== (l = pr.relative(n, o)).charAt(0))
          throw new yr.ErrnoError(55);
        try {
          s = yr.lookupNode(t, u);
        } catch (r) {}
        if (c !== s) {
          var d = yr.isDir(c.mode),
            m = yr.mayDelete(e, a, d);
          if (m) throw new yr.ErrnoError(m);
          if ((m = s ? yr.mayDelete(t, u, d) : yr.mayCreate(t, u)))
            throw new yr.ErrnoError(m);
          if (!e.node_ops.rename) throw new yr.ErrnoError(63);
          if (yr.isMountpoint(c) || (s && yr.isMountpoint(s)))
            throw new yr.ErrnoError(10);
          if (t !== e && (m = yr.nodePermissions(e, "w")))
            throw new yr.ErrnoError(m);
          try {
            yr.trackingDelegate.willMovePath &&
              yr.trackingDelegate.willMovePath(r, n);
          } catch (e) {
            f(
              "FS.trackingDelegate['willMovePath']('" +
                r +
                "', '" +
                n +
                "') threw an exception: " +
                e.message
            );
          }
          yr.hashRemoveNode(c);
          try {
            e.node_ops.rename(c, t, u);
          } catch (r) {
            throw r;
          } finally {
            yr.hashAddNode(c);
          }
          try {
            yr.trackingDelegate.onMovePath &&
              yr.trackingDelegate.onMovePath(r, n);
          } catch (e) {
            f(
              "FS.trackingDelegate['onMovePath']('" +
                r +
                "', '" +
                n +
                "') threw an exception: " +
                e.message
            );
          }
        }
      },
      rmdir: function(r) {
        var n = yr.lookupPath(r, { parent: !0 }).node,
          e = mr.basename(r),
          t = yr.lookupNode(n, e),
          o = yr.mayDelete(n, e, !0);
        if (o) throw new yr.ErrnoError(o);
        if (!n.node_ops.rmdir) throw new yr.ErrnoError(63);
        if (yr.isMountpoint(t)) throw new yr.ErrnoError(10);
        try {
          yr.trackingDelegate.willDeletePath &&
            yr.trackingDelegate.willDeletePath(r);
        } catch (n) {
          f(
            "FS.trackingDelegate['willDeletePath']('" +
              r +
              "') threw an exception: " +
              n.message
          );
        }
        n.node_ops.rmdir(n, e), yr.destroyNode(t);
        try {
          yr.trackingDelegate.onDeletePath &&
            yr.trackingDelegate.onDeletePath(r);
        } catch (n) {
          f(
            "FS.trackingDelegate['onDeletePath']('" +
              r +
              "') threw an exception: " +
              n.message
          );
        }
      },
      readdir: function(r) {
        var n = yr.lookupPath(r, { follow: !0 }).node;
        if (!n.node_ops.readdir) throw new yr.ErrnoError(54);
        return n.node_ops.readdir(n);
      },
      unlink: function(r) {
        var n = yr.lookupPath(r, { parent: !0 }).node,
          e = mr.basename(r),
          t = yr.lookupNode(n, e),
          o = yr.mayDelete(n, e, !1);
        if (o) throw new yr.ErrnoError(o);
        if (!n.node_ops.unlink) throw new yr.ErrnoError(63);
        if (yr.isMountpoint(t)) throw new yr.ErrnoError(10);
        try {
          yr.trackingDelegate.willDeletePath &&
            yr.trackingDelegate.willDeletePath(r);
        } catch (n) {
          f(
            "FS.trackingDelegate['willDeletePath']('" +
              r +
              "') threw an exception: " +
              n.message
          );
        }
        n.node_ops.unlink(n, e), yr.destroyNode(t);
        try {
          yr.trackingDelegate.onDeletePath &&
            yr.trackingDelegate.onDeletePath(r);
        } catch (n) {
          f(
            "FS.trackingDelegate['onDeletePath']('" +
              r +
              "') threw an exception: " +
              n.message
          );
        }
      },
      readlink: function(r) {
        var n = yr.lookupPath(r).node;
        if (!n) throw new yr.ErrnoError(44);
        if (!n.node_ops.readlink) throw new yr.ErrnoError(28);
        return pr.resolve(yr.getPath(n.parent), n.node_ops.readlink(n));
      },
      stat: function(r, n) {
        var e = yr.lookupPath(r, { follow: !n }).node;
        if (!e) throw new yr.ErrnoError(44);
        if (!e.node_ops.getattr) throw new yr.ErrnoError(63);
        return e.node_ops.getattr(e);
      },
      lstat: function(r) {
        return yr.stat(r, !0);
      },
      chmod: function(r, n, e) {
        var t;
        if (
          !(t =
            "string" == typeof r ? yr.lookupPath(r, { follow: !e }).node : r)
            .node_ops.setattr
        )
          throw new yr.ErrnoError(63);
        t.node_ops.setattr(t, {
          mode: (4095 & n) | (-4096 & t.mode),
          timestamp: Date.now()
        });
      },
      lchmod: function(r, n) {
        yr.chmod(r, n, !0);
      },
      fchmod: function(r, n) {
        var e = yr.getStream(r);
        if (!e) throw new yr.ErrnoError(8);
        yr.chmod(e.node, n);
      },
      chown: function(r, n, e, t) {
        var o;
        if (
          !(o =
            "string" == typeof r ? yr.lookupPath(r, { follow: !t }).node : r)
            .node_ops.setattr
        )
          throw new yr.ErrnoError(63);
        o.node_ops.setattr(o, { timestamp: Date.now() });
      },
      lchown: function(r, n, e) {
        yr.chown(r, n, e, !0);
      },
      fchown: function(r, n, e) {
        var t = yr.getStream(r);
        if (!t) throw new yr.ErrnoError(8);
        yr.chown(t.node, n, e);
      },
      truncate: function(r, n) {
        if (n < 0) throw new yr.ErrnoError(28);
        var e;
        if (
          !(e =
            "string" == typeof r ? yr.lookupPath(r, { follow: !0 }).node : r)
            .node_ops.setattr
        )
          throw new yr.ErrnoError(63);
        if (yr.isDir(e.mode)) throw new yr.ErrnoError(31);
        if (!yr.isFile(e.mode)) throw new yr.ErrnoError(28);
        var t = yr.nodePermissions(e, "w");
        if (t) throw new yr.ErrnoError(t);
        e.node_ops.setattr(e, { size: n, timestamp: Date.now() });
      },
      ftruncate: function(r, n) {
        var e = yr.getStream(r);
        if (!e) throw new yr.ErrnoError(8);
        if (0 == (2097155 & e.flags)) throw new yr.ErrnoError(28);
        yr.truncate(e.node, n);
      },
      utime: function(r, n, e) {
        var t = yr.lookupPath(r, { follow: !0 }).node;
        t.node_ops.setattr(t, { timestamp: Math.max(n, e) });
      },
      open: function(n, e, t, o, i) {
        if ("" === n) throw new yr.ErrnoError(44);
        var a;
        if (
          ((t = void 0 === t ? 438 : t),
          (t =
            64 & (e = "string" == typeof e ? yr.modeStringToFlags(e) : e)
              ? (4095 & t) | 32768
              : 0),
          "object" == typeof n)
        )
          a = n;
        else {
          n = mr.normalize(n);
          try {
            a = yr.lookupPath(n, { follow: !(131072 & e) }).node;
          } catch (r) {}
        }
        var u = !1;
        if (64 & e)
          if (a) {
            if (128 & e) throw new yr.ErrnoError(20);
          } else (a = yr.mknod(n, t, 0)), (u = !0);
        if (!a) throw new yr.ErrnoError(44);
        if (
          (yr.isChrdev(a.mode) && (e &= -513), 65536 & e && !yr.isDir(a.mode))
        )
          throw new yr.ErrnoError(54);
        if (!u) {
          var s = yr.mayOpen(a, e);
          if (s) throw new yr.ErrnoError(s);
        }
        512 & e && yr.truncate(a, 0), (e &= -131713);
        var c = yr.createStream(
          {
            node: a,
            path: yr.getPath(a),
            flags: e,
            seekable: !0,
            position: 0,
            stream_ops: a.stream_ops,
            ungotten: [],
            error: !1
          },
          o,
          i
        );
        c.stream_ops.open && c.stream_ops.open(c),
          !r.logReadFiles ||
            1 & e ||
            (yr.readFiles || (yr.readFiles = {}),
            n in yr.readFiles ||
              ((yr.readFiles[n] = 1),
              f("FS.trackingDelegate error on read file: " + n)));
        try {
          if (yr.trackingDelegate.onOpenFile) {
            var l = 0;
            1 != (2097155 & e) && (l |= yr.tracking.openFlags.READ),
              0 != (2097155 & e) && (l |= yr.tracking.openFlags.WRITE),
              yr.trackingDelegate.onOpenFile(n, l);
          }
        } catch (r) {
          f(
            "FS.trackingDelegate['onOpenFile']('" +
              n +
              "', flags) threw an exception: " +
              r.message
          );
        }
        return c;
      },
      close: function(r) {
        if (yr.isClosed(r)) throw new yr.ErrnoError(8);
        r.getdents && (r.getdents = null);
        try {
          r.stream_ops.close && r.stream_ops.close(r);
        } catch (r) {
          throw r;
        } finally {
          yr.closeStream(r.fd);
        }
        r.fd = null;
      },
      isClosed: function(r) {
        return null === r.fd;
      },
      llseek: function(r, n, e) {
        if (yr.isClosed(r)) throw new yr.ErrnoError(8);
        if (!r.seekable || !r.stream_ops.llseek) throw new yr.ErrnoError(70);
        if (0 != e && 1 != e && 2 != e) throw new yr.ErrnoError(28);
        return (
          (r.position = r.stream_ops.llseek(r, n, e)),
          (r.ungotten = []),
          r.position
        );
      },
      read: function(r, n, e, t, o) {
        if (t < 0 || o < 0) throw new yr.ErrnoError(28);
        if (yr.isClosed(r)) throw new yr.ErrnoError(8);
        if (1 == (2097155 & r.flags)) throw new yr.ErrnoError(8);
        if (yr.isDir(r.node.mode)) throw new yr.ErrnoError(31);
        if (!r.stream_ops.read) throw new yr.ErrnoError(28);
        var i = void 0 !== o;
        if (i) {
          if (!r.seekable) throw new yr.ErrnoError(70);
        } else o = r.position;
        var a = r.stream_ops.read(r, n, e, t, o);
        return i || (r.position += a), a;
      },
      write: function(r, n, e, t, o, i) {
        if (t < 0 || o < 0) throw new yr.ErrnoError(28);
        if (yr.isClosed(r)) throw new yr.ErrnoError(8);
        if (0 == (2097155 & r.flags)) throw new yr.ErrnoError(8);
        if (yr.isDir(r.node.mode)) throw new yr.ErrnoError(31);
        if (!r.stream_ops.write) throw new yr.ErrnoError(28);
        r.seekable && 1024 & r.flags && yr.llseek(r, 0, 2);
        var a = void 0 !== o;
        if (a) {
          if (!r.seekable) throw new yr.ErrnoError(70);
        } else o = r.position;
        var u = r.stream_ops.write(r, n, e, t, o, i);
        a || (r.position += u);
        try {
          r.path &&
            yr.trackingDelegate.onWriteToFile &&
            yr.trackingDelegate.onWriteToFile(r.path);
        } catch (n) {
          f(
            "FS.trackingDelegate['onWriteToFile']('" +
              r.path +
              "') threw an exception: " +
              n.message
          );
        }
        return u;
      },
      allocate: function(r, n, e) {
        if (yr.isClosed(r)) throw new yr.ErrnoError(8);
        if (n < 0 || e <= 0) throw new yr.ErrnoError(28);
        if (0 == (2097155 & r.flags)) throw new yr.ErrnoError(8);
        if (!yr.isFile(r.node.mode) && !yr.isDir(r.node.mode))
          throw new yr.ErrnoError(43);
        if (!r.stream_ops.allocate) throw new yr.ErrnoError(138);
        r.stream_ops.allocate(r, n, e);
      },
      mmap: function(r, n, e, t, o, i) {
        if (0 != (2 & o) && 0 == (2 & i) && 2 != (2097155 & r.flags))
          throw new yr.ErrnoError(2);
        if (1 == (2097155 & r.flags)) throw new yr.ErrnoError(2);
        if (!r.stream_ops.mmap) throw new yr.ErrnoError(43);
        return r.stream_ops.mmap(r, n, e, t, o, i);
      },
      msync: function(r, n, e, t, o) {
        return r && r.stream_ops.msync ? r.stream_ops.msync(r, n, e, t, o) : 0;
      },
      munmap: function(r) {
        return 0;
      },
      ioctl: function(r, n, e) {
        if (!r.stream_ops.ioctl) throw new yr.ErrnoError(59);
        return r.stream_ops.ioctl(r, n, e);
      },
      readFile: function(r, n) {
        if (
          (((n = n || {}).flags = n.flags || "r"),
          (n.encoding = n.encoding || "binary"),
          "utf8" !== n.encoding && "binary" !== n.encoding)
        )
          throw new Error('Invalid encoding type "' + n.encoding + '"');
        var e,
          t = yr.open(r, n.flags),
          o = yr.stat(r).size,
          i = new Uint8Array(o);
        return (
          yr.read(t, i, 0, o, 0),
          "utf8" === n.encoding
            ? (e = E(i, 0))
            : "binary" === n.encoding && (e = i),
          yr.close(t),
          e
        );
      },
      writeFile: function(r, n, e) {
        (e = e || {}).flags = e.flags || "w";
        var t = yr.open(r, e.flags, e.mode);
        if ("string" == typeof n) {
          var o = new Uint8Array(D(n) + 1),
            i = k(n, o, 0, o.length);
          yr.write(t, o, 0, i, void 0, e.canOwn);
        } else {
          if (!ArrayBuffer.isView(n)) throw new Error("Unsupported data type");
          yr.write(t, n, 0, n.byteLength, void 0, e.canOwn);
        }
        yr.close(t);
      },
      cwd: function() {
        return yr.currentPath;
      },
      chdir: function(r) {
        var n = yr.lookupPath(r, { follow: !0 });
        if (null === n.node) throw new yr.ErrnoError(44);
        if (!yr.isDir(n.node.mode)) throw new yr.ErrnoError(54);
        var e = yr.nodePermissions(n.node, "x");
        if (e) throw new yr.ErrnoError(e);
        yr.currentPath = n.path;
      },
      createDefaultDirectories: function() {
        yr.mkdir("/tmp"), yr.mkdir("/home"), yr.mkdir("/home/web_user");
      },
      createDefaultDevices: function() {
        var r;
        if (
          (yr.mkdir("/dev"),
          yr.registerDevice(yr.makedev(1, 3), {
            read: function() {
              return 0;
            },
            write: function(r, n, e, t, o) {
              return t;
            }
          }),
          yr.mkdev("/dev/null", yr.makedev(1, 3)),
          hr.register(yr.makedev(5, 0), hr.default_tty_ops),
          hr.register(yr.makedev(6, 0), hr.default_tty1_ops),
          yr.mkdev("/dev/tty", yr.makedev(5, 0)),
          yr.mkdev("/dev/tty1", yr.makedev(6, 0)),
          "object" == typeof crypto &&
            "function" == typeof crypto.getRandomValues)
        ) {
          var n = new Uint8Array(1);
          r = function() {
            return crypto.getRandomValues(n), n[0];
          };
        }
        r ||
          (r = function() {
            er("random_device");
          }),
          yr.createDevice("/dev", "random", r),
          yr.createDevice("/dev", "urandom", r),
          yr.mkdir("/dev/shm"),
          yr.mkdir("/dev/shm/tmp");
      },
      createSpecialDirectories: function() {
        yr.mkdir("/proc"),
          yr.mkdir("/proc/self"),
          yr.mkdir("/proc/self/fd"),
          yr.mount(
            {
              mount: function() {
                var r = yr.createNode("/proc/self", "fd", 16895, 73);
                return (
                  (r.node_ops = {
                    lookup: function(r, n) {
                      var e = +n,
                        t = yr.getStream(e);
                      if (!t) throw new yr.ErrnoError(8);
                      var o = {
                        parent: null,
                        mount: { mountpoint: "fake" },
                        node_ops: {
                          readlink: function() {
                            return t.path;
                          }
                        }
                      };
                      return (o.parent = o), o;
                    }
                  }),
                  r
                );
              }
            },
            {},
            "/proc/self/fd"
          );
      },
      createStandardStreams: function() {
        r.stdin
          ? yr.createDevice("/dev", "stdin", r.stdin)
          : yr.symlink("/dev/tty", "/dev/stdin"),
          r.stdout
            ? yr.createDevice("/dev", "stdout", null, r.stdout)
            : yr.symlink("/dev/tty", "/dev/stdout"),
          r.stderr
            ? yr.createDevice("/dev", "stderr", null, r.stderr)
            : yr.symlink("/dev/tty1", "/dev/stderr"),
          yr.open("/dev/stdin", "r"),
          yr.open("/dev/stdout", "w"),
          yr.open("/dev/stderr", "w");
      },
      ensureErrnoError: function() {
        yr.ErrnoError ||
          ((yr.ErrnoError = function(r, n) {
            (this.node = n),
              (this.setErrno = function(r) {
                this.errno = r;
              }),
              this.setErrno(r),
              (this.message = "FS error");
          }),
          (yr.ErrnoError.prototype = new Error()),
          (yr.ErrnoError.prototype.constructor = yr.ErrnoError),
          [44].forEach(function(r) {
            (yr.genericErrors[r] = new yr.ErrnoError(r)),
              (yr.genericErrors[r].stack = "<generic error, no stack>");
          }));
      },
      staticInit: function() {
        yr.ensureErrnoError(),
          (yr.nameTable = new Array(4096)),
          yr.mount(vr, {}, "/"),
          yr.createDefaultDirectories(),
          yr.createDefaultDevices(),
          yr.createSpecialDirectories(),
          (yr.filesystems = { MEMFS: vr });
      },
      init: function(n, e, t) {
        (yr.init.initialized = !0),
          yr.ensureErrnoError(),
          (r.stdin = n || r.stdin),
          (r.stdout = e || r.stdout),
          (r.stderr = t || r.stderr),
          yr.createStandardStreams();
      },
      quit: function() {
        yr.init.initialized = !1;
        var n = r._fflush;
        n && n(0);
        for (var e = 0; e < yr.streams.length; e++) {
          var t = yr.streams[e];
          t && yr.close(t);
        }
      },
      getMode: function(r, n) {
        var e = 0;
        return r && (e |= 365), n && (e |= 146), e;
      },
      joinPath: function(r, n) {
        var e = mr.join.apply(null, r);
        return n && "/" == e[0] && (e = e.substr(1)), e;
      },
      absolutePath: function(r, n) {
        return pr.resolve(n, r);
      },
      standardizePath: function(r) {
        return mr.normalize(r);
      },
      findObject: function(r, n) {
        var e = yr.analyzePath(r, n);
        return e.exists ? e.object : (dr(e.error), null);
      },
      analyzePath: function(r, n) {
        try {
          r = (t = yr.lookupPath(r, { follow: !n })).path;
        } catch (r) {}
        var e = {
          isRoot: !1,
          exists: !1,
          error: 0,
          name: null,
          path: null,
          object: null,
          parentExists: !1,
          parentPath: null,
          parentObject: null
        };
        try {
          var t = yr.lookupPath(r, { parent: !0 });
          (e.parentExists = !0),
            (e.parentPath = t.path),
            (e.parentObject = t.node),
            (e.name = mr.basename(r)),
            (t = yr.lookupPath(r, { follow: !n })),
            (e.exists = !0),
            (e.path = t.path),
            (e.object = t.node),
            (e.name = t.node.name),
            (e.isRoot = "/" === t.path);
        } catch (r) {
          e.error = r.errno;
        }
        return e;
      },
      createFolder: function(r, n, e, t) {
        var o = mr.join2("string" == typeof r ? r : yr.getPath(r), n),
          i = yr.getMode(e, t);
        return yr.mkdir(o, i);
      },
      createPath: function(r, n, e, t) {
        r = "string" == typeof r ? r : yr.getPath(r);
        for (var o = n.split("/").reverse(); o.length; ) {
          var i = o.pop();
          if (i) {
            var a = mr.join2(r, i);
            try {
              yr.mkdir(a);
            } catch (r) {}
            r = a;
          }
        }
        return a;
      },
      createFile: function(r, n, e, t, o) {
        var i = mr.join2("string" == typeof r ? r : yr.getPath(r), n),
          a = yr.getMode(t, o);
        return yr.create(i, a);
      },
      createDataFile: function(r, n, e, t, o, i) {
        var a = n ? mr.join2("string" == typeof r ? r : yr.getPath(r), n) : r,
          u = yr.getMode(t, o),
          s = yr.create(a, u);
        if (e) {
          if ("string" == typeof e) {
            for (var c = new Array(e.length), l = 0, f = e.length; l < f; ++l)
              c[l] = e.charCodeAt(l);
            e = c;
          }
          yr.chmod(s, 146 | u);
          var d = yr.open(s, "w");
          yr.write(d, e, 0, e.length, 0, i), yr.close(d), yr.chmod(s, u);
        }
        return s;
      },
      createDevice: function(r, n, e, t) {
        var o = mr.join2("string" == typeof r ? r : yr.getPath(r), n),
          i = yr.getMode(!!e, !!t);
        yr.createDevice.major || (yr.createDevice.major = 64);
        var a = yr.makedev(yr.createDevice.major++, 0);
        return (
          yr.registerDevice(a, {
            open: function(r) {
              r.seekable = !1;
            },
            close: function(r) {
              t && t.buffer && t.buffer.length && t(10);
            },
            read: function(r, n, t, o, i) {
              for (var a = 0, u = 0; u < o; u++) {
                var s;
                try {
                  s = e();
                } catch (r) {
                  throw new yr.ErrnoError(29);
                }
                if (void 0 === s && 0 === a) throw new yr.ErrnoError(6);
                if (null == s) break;
                a++, (n[t + u] = s);
              }
              return a && (r.node.timestamp = Date.now()), a;
            },
            write: function(r, n, e, o, i) {
              for (var a = 0; a < o; a++)
                try {
                  t(n[e + a]);
                } catch (r) {
                  throw new yr.ErrnoError(29);
                }
              return o && (r.node.timestamp = Date.now()), a;
            }
          }),
          yr.mkdev(o, i, a)
        );
      },
      createLink: function(r, n, e, t, o) {
        var i = mr.join2("string" == typeof r ? r : yr.getPath(r), n);
        return yr.symlink(e, i);
      },
      forceLoadFile: function(r) {
        if (r.isDevice || r.isFolder || r.link || r.contents) return !0;
        var n = !0;
        if ("undefined" != typeof XMLHttpRequest)
          throw new Error(
            "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
          );
        if (!i)
          throw new Error("Cannot load without read() or XMLHttpRequest.");
        try {
          (r.contents = rn(i(r.url), !0)), (r.usedBytes = r.contents.length);
        } catch (r) {
          n = !1;
        }
        return n || dr(29), n;
      },
      createLazyFile: function(r, n, e, t, o) {
        function i() {
          (this.lengthKnown = !1), (this.chunks = []);
        }
        if (
          ((i.prototype.get = function(r) {
            if (!(r > this.length - 1 || r < 0)) {
              var n = r % this.chunkSize,
                e = (r / this.chunkSize) | 0;
              return this.getter(e)[n];
            }
          }),
          (i.prototype.setDataGetter = function(r) {
            this.getter = r;
          }),
          (i.prototype.cacheLength = function() {
            var r = new XMLHttpRequest();
            if (
              (r.open("HEAD", e, !1),
              r.send(null),
              !((r.status >= 200 && r.status < 300) || 304 === r.status))
            )
              throw new Error("Couldn't load " + e + ". Status: " + r.status);
            var n,
              t = Number(r.getResponseHeader("Content-length")),
              o = (n = r.getResponseHeader("Accept-Ranges")) && "bytes" === n,
              i = (n = r.getResponseHeader("Content-Encoding")) && "gzip" === n,
              a = 1048576;
            o || (a = t);
            var u = this;
            u.setDataGetter(function(r) {
              var n = r * a,
                o = (r + 1) * a - 1;
              if (
                ((o = Math.min(o, t - 1)),
                void 0 === u.chunks[r] &&
                  (u.chunks[r] = (function(r, n) {
                    if (r > n)
                      throw new Error(
                        "invalid range (" +
                          r +
                          ", " +
                          n +
                          ") or no bytes requested!"
                      );
                    if (n > t - 1)
                      throw new Error(
                        "only " + t + " bytes available! programmer error!"
                      );
                    var o = new XMLHttpRequest();
                    if (
                      (o.open("GET", e, !1),
                      t !== a &&
                        o.setRequestHeader("Range", "bytes=" + r + "-" + n),
                      "undefined" != typeof Uint8Array &&
                        (o.responseType = "arraybuffer"),
                      o.overrideMimeType &&
                        o.overrideMimeType(
                          "text/plain; charset=x-user-defined"
                        ),
                      o.send(null),
                      !(
                        (o.status >= 200 && o.status < 300) ||
                        304 === o.status
                      ))
                    )
                      throw new Error(
                        "Couldn't load " + e + ". Status: " + o.status
                      );
                    return void 0 !== o.response
                      ? new Uint8Array(o.response || [])
                      : rn(o.responseText || "", !0);
                  })(n, o)),
                void 0 === u.chunks[r])
              )
                throw new Error("doXHR failed!");
              return u.chunks[r];
            }),
              (!i && t) ||
                ((a = t = 1),
                (t = this.getter(0).length),
                (a = t),
                l(
                  "LazyFiles on gzip forces download of the whole file when length is accessed"
                )),
              (this._length = t),
              (this._chunkSize = a),
              (this.lengthKnown = !0);
          }),
          "undefined" != typeof XMLHttpRequest)
        ) {
          var a = new i();
          Object.defineProperties(a, {
            length: {
              get: function() {
                return this.lengthKnown || this.cacheLength(), this._length;
              }
            },
            chunkSize: {
              get: function() {
                return this.lengthKnown || this.cacheLength(), this._chunkSize;
              }
            }
          });
          var u = { isDevice: !1, contents: a };
        } else u = { isDevice: !1, url: e };
        var s = yr.createFile(r, n, u, t, o);
        u.contents
          ? (s.contents = u.contents)
          : u.url && ((s.contents = null), (s.url = u.url)),
          Object.defineProperties(s, {
            usedBytes: {
              get: function() {
                return this.contents.length;
              }
            }
          });
        var c = {};
        return (
          Object.keys(s.stream_ops).forEach(function(r) {
            var n = s.stream_ops[r];
            c[r] = function() {
              if (!yr.forceLoadFile(s)) throw new yr.ErrnoError(29);
              return n.apply(null, arguments);
            };
          }),
          (c.read = function(r, n, e, t, o) {
            if (!yr.forceLoadFile(s)) throw new yr.ErrnoError(29);
            var i = r.node.contents;
            if (o >= i.length) return 0;
            var a = Math.min(i.length - o, t);
            if (i.slice) for (var u = 0; u < a; u++) n[e + u] = i[o + u];
            else for (u = 0; u < a; u++) n[e + u] = i.get(o + u);
            return a;
          }),
          (s.stream_ops = c),
          s
        );
      },
      createPreloadedFile: function(n, e, t, o, i, a, u, s, c, l) {
        Browser.init();
        var f = e ? pr.resolve(mr.join2(n, e)) : n;
        function d(t) {
          function d(r) {
            l && l(), s || yr.createDataFile(n, e, r, o, i, c), a && a(), nr();
          }
          var m = !1;
          r.preloadPlugins.forEach(function(r) {
            m ||
              (r.canHandle(f) &&
                (r.handle(t, f, d, function() {
                  u && u(), nr();
                }),
                (m = !0)));
          }),
            m || d(t);
        }
        rr(),
          "string" == typeof t
            ? Browser.asyncLoad(
                t,
                function(r) {
                  d(r);
                },
                u
              )
            : d(t);
      },
      indexedDB: function() {
        return (
          window.indexedDB ||
          window.mozIndexedDB ||
          window.webkitIndexedDB ||
          window.msIndexedDB
        );
      },
      DB_NAME: function() {
        return "EM_FS_" + window.location.pathname;
      },
      DB_VERSION: 20,
      DB_STORE_NAME: "FILE_DATA",
      saveFilesToDB: function(r, n, e) {
        (n = n || function() {}), (e = e || function() {});
        var t = yr.indexedDB();
        try {
          var o = t.open(yr.DB_NAME(), yr.DB_VERSION);
        } catch (r) {
          return e(r);
        }
        (o.onupgradeneeded = function() {
          l("creating db"), o.result.createObjectStore(yr.DB_STORE_NAME);
        }),
          (o.onsuccess = function() {
            var t = o.result.transaction([yr.DB_STORE_NAME], "readwrite"),
              i = t.objectStore(yr.DB_STORE_NAME),
              a = 0,
              u = 0,
              s = r.length;
            function c() {
              0 == u ? n() : e();
            }
            r.forEach(function(r) {
              var n = i.put(yr.analyzePath(r).object.contents, r);
              (n.onsuccess = function() {
                ++a + u == s && c();
              }),
                (n.onerror = function() {
                  u++, a + u == s && c();
                });
            }),
              (t.onerror = e);
          }),
          (o.onerror = e);
      },
      loadFilesFromDB: function(r, n, e) {
        (n = n || function() {}), (e = e || function() {});
        var t = yr.indexedDB();
        try {
          var o = t.open(yr.DB_NAME(), yr.DB_VERSION);
        } catch (r) {
          return e(r);
        }
        (o.onupgradeneeded = e),
          (o.onsuccess = function() {
            var t = o.result;
            try {
              var i = t.transaction([yr.DB_STORE_NAME], "readonly");
            } catch (r) {
              return void e(r);
            }
            var a = i.objectStore(yr.DB_STORE_NAME),
              u = 0,
              s = 0,
              c = r.length;
            function l() {
              0 == s ? n() : e();
            }
            r.forEach(function(r) {
              var n = a.get(r);
              (n.onsuccess = function() {
                yr.analyzePath(r).exists && yr.unlink(r),
                  yr.createDataFile(
                    mr.dirname(r),
                    mr.basename(r),
                    n.result,
                    !0,
                    !0,
                    !0
                  ),
                  ++u + s == c && l();
              }),
                (n.onerror = function() {
                  s++, u + s == c && l();
                });
            }),
              (i.onerror = e);
          }),
          (o.onerror = e);
      },
      mmapAlloc: function(r) {
        for (
          var n = (function(r, n) {
              return n || (n = 16), Math.ceil(r / n) * n;
            })(r, 16384),
            e = on(n);
          r < n;

        )
          S[e + r++] = 0;
        return e;
      }
    },
    gr = {
      mappings: {},
      DEFAULT_POLLMASK: 5,
      umask: 511,
      calculateAt: function(r, n) {
        if ("/" !== n[0]) {
          var e;
          if (-100 === r) e = yr.cwd();
          else {
            var t = yr.getStream(r);
            if (!t) throw new yr.ErrnoError(8);
            e = t.path;
          }
          n = mr.join2(e, n);
        }
        return n;
      },
      doStat: function(r, n, e) {
        try {
          var t = r(n);
        } catch (r) {
          if (
            r &&
            r.node &&
            mr.normalize(n) !== mr.normalize(yr.getPath(r.node))
          )
            return -54;
          throw r;
        }
        return (
          (T[e >> 2] = t.dev),
          (T[(e + 4) >> 2] = 0),
          (T[(e + 8) >> 2] = t.ino),
          (T[(e + 12) >> 2] = t.mode),
          (T[(e + 16) >> 2] = t.nlink),
          (T[(e + 20) >> 2] = t.uid),
          (T[(e + 24) >> 2] = t.gid),
          (T[(e + 28) >> 2] = t.rdev),
          (T[(e + 32) >> 2] = 0),
          (ar = [
            t.size >>> 0,
            ((ir = t.size),
            +G(ir) >= 1
              ? ir > 0
                ? (0 | Z(+J(ir / 4294967296), 4294967295)) >>> 0
                : ~~+K((ir - +(~~ir >>> 0)) / 4294967296) >>> 0
              : 0)
          ]),
          (T[(e + 40) >> 2] = ar[0]),
          (T[(e + 44) >> 2] = ar[1]),
          (T[(e + 48) >> 2] = 4096),
          (T[(e + 52) >> 2] = t.blocks),
          (T[(e + 56) >> 2] = (t.atime.getTime() / 1e3) | 0),
          (T[(e + 60) >> 2] = 0),
          (T[(e + 64) >> 2] = (t.mtime.getTime() / 1e3) | 0),
          (T[(e + 68) >> 2] = 0),
          (T[(e + 72) >> 2] = (t.ctime.getTime() / 1e3) | 0),
          (T[(e + 76) >> 2] = 0),
          (ar = [
            t.ino >>> 0,
            ((ir = t.ino),
            +G(ir) >= 1
              ? ir > 0
                ? (0 | Z(+J(ir / 4294967296), 4294967295)) >>> 0
                : ~~+K((ir - +(~~ir >>> 0)) / 4294967296) >>> 0
              : 0)
          ]),
          (T[(e + 80) >> 2] = ar[0]),
          (T[(e + 84) >> 2] = ar[1]),
          0
        );
      },
      doMsync: function(r, n, e, t, o) {
        var i = C.slice(r, r + e);
        yr.msync(n, i, o, e, t);
      },
      doMkdir: function(r, n) {
        return (
          "/" === (r = mr.normalize(r))[r.length - 1] &&
            (r = r.substr(0, r.length - 1)),
          yr.mkdir(r, n, 0),
          0
        );
      },
      doMknod: function(r, n, e) {
        switch (61440 & n) {
          case 32768:
          case 8192:
          case 24576:
          case 4096:
          case 49152:
            break;
          default:
            return -28;
        }
        return yr.mknod(r, n, e), 0;
      },
      doReadlink: function(r, n, e) {
        if (e <= 0) return -28;
        var t = yr.readlink(r),
          o = Math.min(e, D(t)),
          i = S[n + o];
        return b(t, n, e + 1), (S[n + o] = i), o;
      },
      doAccess: function(r, n) {
        if (-8 & n) return -28;
        var e;
        if (!(e = yr.lookupPath(r, { follow: !0 }).node)) return -44;
        var t = "";
        return (
          4 & n && (t += "r"),
          2 & n && (t += "w"),
          1 & n && (t += "x"),
          t && yr.nodePermissions(e, t) ? -2 : 0
        );
      },
      doDup: function(r, n, e) {
        var t = yr.getStream(e);
        return t && yr.close(t), yr.open(r, n, 0, e, e).fd;
      },
      doReadv: function(r, n, e, t) {
        for (var o = 0, i = 0; i < e; i++) {
          var a = T[(n + 8 * i) >> 2],
            u = T[(n + (8 * i + 4)) >> 2],
            s = yr.read(r, S, a, u, t);
          if (s < 0) return -1;
          if (((o += s), s < u)) break;
        }
        return o;
      },
      doWritev: function(r, n, e, t) {
        for (var o = 0, i = 0; i < e; i++) {
          var a = T[(n + 8 * i) >> 2],
            u = T[(n + (8 * i + 4)) >> 2],
            s = yr.write(r, S, a, u, t);
          if (s < 0) return -1;
          o += s;
        }
        return o;
      },
      varargs: void 0,
      get: function() {
        return (gr.varargs += 4), T[(gr.varargs - 4) >> 2];
      },
      getStr: function(r) {
        return _(r);
      },
      getStreamFromFD: function(r) {
        var n = yr.getStream(r);
        if (!n) throw new yr.ErrnoError(8);
        return n;
      },
      get64: function(r, n) {
        return r;
      }
    };
  function wr(r) {
    switch (r) {
      case 1:
        return 0;
      case 2:
        return 1;
      case 4:
        return 2;
      case 8:
        return 3;
      default:
        throw new TypeError("Unknown type size: " + r);
    }
  }
  var Er = void 0;
  function _r(r) {
    for (var n = "", e = r; C[e]; ) n += Er[C[e++]];
    return n;
  }
  var kr = {},
    br = {},
    Dr = {};
  function Fr(r, n) {
    var e,
      t =
        ((e = function(r) {
          (this.name = n), (this.message = r);
          var e = new Error(r).stack;
          void 0 !== e &&
            (this.stack =
              this.toString() + "\n" + e.replace(/^Error(:[^\n]*)?\n/, ""));
        }),
        (function(r) {
          if (void 0 === r) return "_unknown";
          var n = (r = r.replace(/[^a-zA-Z0-9_]/g, "$")).charCodeAt(0);
        })(n),
        function() {
          return e.apply(this, arguments);
        });
    return (
      (t.prototype = Object.create(r.prototype)),
      (t.prototype.constructor = t),
      (t.prototype.toString = function() {
        return void 0 === this.message
          ? this.name
          : this.name + ": " + this.message;
      }),
      t
    );
  }
  var Sr = void 0;
  function Cr(r) {
    throw new Sr(r);
  }
  var Pr = void 0;
  function Ar(r) {
    throw new Pr(r);
  }
  function Tr(r, n, e) {
    if (((e = e || {}), !("argPackAdvance" in n)))
      throw new TypeError(
        "registerType registeredInstance requires argPackAdvance"
      );
    var t = n.name;
    if (
      (r || Cr('type "' + t + '" must have a positive integer typeid pointer'),
      br.hasOwnProperty(r))
    ) {
      if (e.ignoreDuplicateRegistrations) return;
      Cr("Cannot register type '" + t + "' twice");
    }
    if (((br[r] = n), delete Dr[r], kr.hasOwnProperty(r))) {
      var o = kr[r];
      delete kr[r],
        o.forEach(function(r) {
          r();
        });
    }
  }
  var Mr = [],
    xr = [{}, { value: void 0 }, { value: null }, { value: !0 }, { value: !1 }];
  function jr() {
    for (var r = 0, n = 5; n < xr.length; ++n) void 0 !== xr[n] && ++r;
    return r;
  }
  function Rr() {
    for (var r = 5; r < xr.length; ++r) if (void 0 !== xr[r]) return xr[r];
    return null;
  }
  function Or(r) {
    return this.fromWireType(M[r >> 2]);
  }
  function zr(r) {
    if (null === r) return "null";
    var n = typeof r;
    return "object" === n || "array" === n || "function" === n
      ? r.toString()
      : "" + r;
  }
  function Nr(r, n) {
    switch (n) {
      case 2:
        return function(r) {
          return this.fromWireType(x[r >> 2]);
        };
      case 3:
        return function(r) {
          return this.fromWireType(j[r >> 3]);
        };
      default:
        throw new TypeError("Unknown float type: " + r);
    }
  }
  function Br(r) {
    for (; r.length; ) {
      var n = r.pop();
      r.pop()(n);
    }
  }
  function Ir(n, e, t) {
    r.hasOwnProperty(n)
      ? ((void 0 === t ||
          (void 0 !== r[n].overloadTable &&
            void 0 !== r[n].overloadTable[t])) &&
          Cr("Cannot register public name '" + n + "' twice"),
        (function(r, n, e) {
          if (void 0 === r[n].overloadTable) {
            var t = r[n];
            (r[n] = function() {
              return (
                r[n].overloadTable.hasOwnProperty(arguments.length) ||
                  Cr(
                    "Function '" +
                      e +
                      "' called with an invalid number of arguments (" +
                      arguments.length +
                      ") - expects one of (" +
                      r[n].overloadTable +
                      ")!"
                  ),
                r[n].overloadTable[arguments.length].apply(this, arguments)
              );
            }),
              (r[n].overloadTable = []),
              (r[n].overloadTable[t.argCount] = t);
          }
        })(r, n, n),
        r.hasOwnProperty(t) &&
          Cr(
            "Cannot register multiple overloads of a function with the same number of arguments (" +
              t +
              ")!"
          ),
        (r[n].overloadTable[t] = e))
      : ((r[n] = e), void 0 !== t && (r[n].numArguments = t));
  }
  var Wr = void 0;
  function Lr(r) {
    var n = ln(r),
      e = _r(n);
    return an(n), e;
  }
  function Ur(r, n, e) {
    switch (n) {
      case 0:
        return e
          ? function(r) {
              return S[r];
            }
          : function(r) {
              return C[r];
            };
      case 1:
        return e
          ? function(r) {
              return P[r >> 1];
            }
          : function(r) {
              return A[r >> 1];
            };
      case 2:
        return e
          ? function(r) {
              return T[r >> 2];
            }
          : function(r) {
              return M[r >> 2];
            };
      default:
        throw new TypeError("Unknown integer type: " + r);
    }
  }
  function Hr(r) {
    try {
      return p.grow((r - F.byteLength + 65535) >>> 16), L(p.buffer), 1;
    } catch (r) {}
  }
  var Yr = {};
  function qr() {
    if (!qr.strings) {
      var r = {
        USER: "web_user",
        LOGNAME: "web_user",
        PATH: "/",
        PWD: "/",
        HOME: "/home/web_user",
        LANG:
          (
            ("object" == typeof navigator &&
              navigator.languages &&
              navigator.languages[0]) ||
            "C"
          ).replace("-", "_") + ".UTF-8",
        _: u || "./this.program"
      };
      for (var n in Yr) r[n] = Yr[n];
      var e = [];
      for (var n in r) e.push(n + "=" + r[n]);
      qr.strings = e;
    }
    return qr.strings;
  }
  function Vr(r) {
    return r % 4 == 0 && (r % 100 != 0 || r % 400 == 0);
  }
  function Xr(r, n) {
    for (var e = 0, t = 0; t <= n; e += r[t++]);
    return e;
  }
  var Gr = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    Kr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function Jr(r, n) {
    for (var e = new Date(r.getTime()); n > 0; ) {
      var t = Vr(e.getFullYear()),
        o = e.getMonth(),
        i = (t ? Gr : Kr)[o];
      if (!(n > i - e.getDate())) return e.setDate(e.getDate() + n), e;
      (n -= i - e.getDate() + 1),
        e.setDate(1),
        o < 11
          ? e.setMonth(o + 1)
          : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1));
    }
    return e;
  }
  function Zr(r, n, e, t) {
    var o = T[(t + 40) >> 2],
      i = {
        tm_sec: T[t >> 2],
        tm_min: T[(t + 4) >> 2],
        tm_hour: T[(t + 8) >> 2],
        tm_mday: T[(t + 12) >> 2],
        tm_mon: T[(t + 16) >> 2],
        tm_year: T[(t + 20) >> 2],
        tm_wday: T[(t + 24) >> 2],
        tm_yday: T[(t + 28) >> 2],
        tm_isdst: T[(t + 32) >> 2],
        tm_gmtoff: T[(t + 36) >> 2],
        tm_zone: o ? _(o) : ""
      },
      a = _(e),
      u = {
        "%c": "%a %b %d %H:%M:%S %Y",
        "%D": "%m/%d/%y",
        "%F": "%Y-%m-%d",
        "%h": "%b",
        "%r": "%I:%M:%S %p",
        "%R": "%H:%M",
        "%T": "%H:%M:%S",
        "%x": "%m/%d/%y",
        "%X": "%H:%M:%S",
        "%Ec": "%c",
        "%EC": "%C",
        "%Ex": "%m/%d/%y",
        "%EX": "%H:%M:%S",
        "%Ey": "%y",
        "%EY": "%Y",
        "%Od": "%d",
        "%Oe": "%e",
        "%OH": "%H",
        "%OI": "%I",
        "%Om": "%m",
        "%OM": "%M",
        "%OS": "%S",
        "%Ou": "%u",
        "%OU": "%U",
        "%OV": "%V",
        "%Ow": "%w",
        "%OW": "%W",
        "%Oy": "%y"
      };
    for (var s in u) a = a.replace(new RegExp(s, "g"), u[s]);
    var c = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      l = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
    function f(r, n, e) {
      for (
        var t = "number" == typeof r ? r.toString() : r || "";
        t.length < n;

      )
        t = e[0] + t;
      return t;
    }
    function d(r, n) {
      return f(r, n, "0");
    }
    function m(r, n) {
      function e(r) {
        return r < 0 ? -1 : r > 0 ? 1 : 0;
      }
      var t;
      return (
        0 === (t = e(r.getFullYear() - n.getFullYear())) &&
          0 === (t = e(r.getMonth() - n.getMonth())) &&
          (t = e(r.getDate() - n.getDate())),
        t
      );
    }
    function p(r) {
      switch (r.getDay()) {
        case 0:
          return new Date(r.getFullYear() - 1, 11, 29);
        case 1:
          return r;
        case 2:
          return new Date(r.getFullYear(), 0, 3);
        case 3:
          return new Date(r.getFullYear(), 0, 2);
        case 4:
          return new Date(r.getFullYear(), 0, 1);
        case 5:
          return new Date(r.getFullYear() - 1, 11, 31);
        case 6:
          return new Date(r.getFullYear() - 1, 11, 30);
      }
    }
    function h(r) {
      var n = Jr(new Date(r.tm_year + 1900, 0, 1), r.tm_yday),
        e = new Date(n.getFullYear(), 0, 4),
        t = new Date(n.getFullYear() + 1, 0, 4),
        o = p(e),
        i = p(t);
      return m(o, n) <= 0
        ? m(i, n) <= 0
          ? n.getFullYear() + 1
          : n.getFullYear()
        : n.getFullYear() - 1;
    }
    var v = {
      "%a": function(r) {
        return c[r.tm_wday].substring(0, 3);
      },
      "%A": function(r) {
        return c[r.tm_wday];
      },
      "%b": function(r) {
        return l[r.tm_mon].substring(0, 3);
      },
      "%B": function(r) {
        return l[r.tm_mon];
      },
      "%C": function(r) {
        return d(((r.tm_year + 1900) / 100) | 0, 2);
      },
      "%d": function(r) {
        return d(r.tm_mday, 2);
      },
      "%e": function(r) {
        return f(r.tm_mday, 2, " ");
      },
      "%g": function(r) {
        return h(r)
          .toString()
          .substring(2);
      },
      "%G": function(r) {
        return h(r);
      },
      "%H": function(r) {
        return d(r.tm_hour, 2);
      },
      "%I": function(r) {
        var n = r.tm_hour;
        return 0 == n ? (n = 12) : n > 12 && (n -= 12), d(n, 2);
      },
      "%j": function(r) {
        return d(
          r.tm_mday + Xr(Vr(r.tm_year + 1900) ? Gr : Kr, r.tm_mon - 1),
          3
        );
      },
      "%m": function(r) {
        return d(r.tm_mon + 1, 2);
      },
      "%M": function(r) {
        return d(r.tm_min, 2);
      },
      "%n": function() {
        return "\n";
      },
      "%p": function(r) {
        return r.tm_hour >= 0 && r.tm_hour < 12 ? "AM" : "PM";
      },
      "%S": function(r) {
        return d(r.tm_sec, 2);
      },
      "%t": function() {
        return "\t";
      },
      "%u": function(r) {
        return r.tm_wday || 7;
      },
      "%U": function(r) {
        var n = new Date(r.tm_year + 1900, 0, 1),
          e = 0 === n.getDay() ? n : Jr(n, 7 - n.getDay()),
          t = new Date(r.tm_year + 1900, r.tm_mon, r.tm_mday);
        if (m(e, t) < 0) {
          var o = Xr(Vr(t.getFullYear()) ? Gr : Kr, t.getMonth() - 1) - 31,
            i = 31 - e.getDate() + o + t.getDate();
          return d(Math.ceil(i / 7), 2);
        }
        return 0 === m(e, n) ? "01" : "00";
      },
      "%V": function(r) {
        var n,
          e = new Date(r.tm_year + 1900, 0, 4),
          t = new Date(r.tm_year + 1901, 0, 4),
          o = p(e),
          i = p(t),
          a = Jr(new Date(r.tm_year + 1900, 0, 1), r.tm_yday);
        return m(a, o) < 0
          ? "53"
          : m(i, a) <= 0
          ? "01"
          : ((n =
              o.getFullYear() < r.tm_year + 1900
                ? r.tm_yday + 32 - o.getDate()
                : r.tm_yday + 1 - o.getDate()),
            d(Math.ceil(n / 7), 2));
      },
      "%w": function(r) {
        return r.tm_wday;
      },
      "%W": function(r) {
        var n = new Date(r.tm_year, 0, 1),
          e =
            1 === n.getDay()
              ? n
              : Jr(n, 0 === n.getDay() ? 1 : 7 - n.getDay() + 1),
          t = new Date(r.tm_year + 1900, r.tm_mon, r.tm_mday);
        if (m(e, t) < 0) {
          var o = Xr(Vr(t.getFullYear()) ? Gr : Kr, t.getMonth() - 1) - 31,
            i = 31 - e.getDate() + o + t.getDate();
          return d(Math.ceil(i / 7), 2);
        }
        return 0 === m(e, n) ? "01" : "00";
      },
      "%y": function(r) {
        return (r.tm_year + 1900).toString().substring(2);
      },
      "%Y": function(r) {
        return r.tm_year + 1900;
      },
      "%z": function(r) {
        var n = r.tm_gmtoff,
          e = n >= 0;
        return (
          (n = ((n = Math.abs(n) / 60) / 60) * 100 + (n % 60)),
          (e ? "+" : "-") + String("0000" + n).slice(-4)
        );
      },
      "%Z": function(r) {
        return r.tm_zone;
      },
      "%%": function() {
        return "%";
      }
    };
    for (var s in v)
      a.indexOf(s) >= 0 && (a = a.replace(new RegExp(s, "g"), v[s](i)));
    var y = rn(a, !1);
    return y.length > n
      ? 0
      : ((function(r, n) {
          S.set(r, n);
        })(y, r),
        y.length - 1);
  }
  var $r = [],
    Qr = function(r, n, e, t) {
      r || (r = this),
        (this.parent = r),
        (this.mount = r.mount),
        (this.mounted = null),
        (this.id = yr.nextInode++),
        (this.name = n),
        (this.mode = e),
        (this.node_ops = {}),
        (this.stream_ops = {}),
        (this.rdev = t);
    };
  function rn(r, n, e) {
    var t = e > 0 ? e : D(r) + 1,
      o = new Array(t),
      i = k(r, o, 0, o.length);
    return n && (o.length = i), o;
  }
  Object.defineProperties(Qr.prototype, {
    read: {
      get: function() {
        return 365 == (365 & this.mode);
      },
      set: function(r) {
        r ? (this.mode |= 365) : (this.mode &= -366);
      }
    },
    write: {
      get: function() {
        return 146 == (146 & this.mode);
      },
      set: function(r) {
        r ? (this.mode |= 146) : (this.mode &= -147);
      }
    },
    isFolder: {
      get: function() {
        return yr.isDir(this.mode);
      }
    },
    isDevice: {
      get: function() {
        return yr.isChrdev(this.mode);
      }
    }
  }),
    (yr.FSNode = Qr),
    yr.staticInit(),
    (function() {
      for (var r = new Array(256), n = 0; n < 256; ++n)
        r[n] = String.fromCharCode(n);
      Er = r;
    })(),
    (Sr = r.BindingError = Fr(Error, "BindingError")),
    (Pr = r.InternalError = Fr(Error, "InternalError")),
    (r.count_emval_handles = jr),
    (r.get_first_emval = Rr),
    (Wr = r.UnboundTypeError = Fr(Error, "UnboundTypeError"));
  var nn,
    en = {
      a: function(r, n, e, t) {
        er(
          "Assertion failed: " +
            _(r) +
            ", at: " +
            [n ? _(n) : "unknown filename", e, t ? _(t) : "unknown function"]
        );
      },
      V: function(r, n) {
        return (function(r, n) {
          var e;
          if (0 === r) e = Date.now();
          else {
            if (1 !== r && 4 !== r) return dr(28), -1;
            e = cr();
          }
          return (
            (T[n >> 2] = (e / 1e3) | 0),
            (T[(n + 4) >> 2] = ((e % 1e3) * 1e3 * 1e3) | 0),
            0
          );
        })(r, n);
      },
      n: function(r) {
        return on(r);
      },
      m: function(r, n, e) {
        throw r;
      },
      S: function(r, n) {
        return dr(63), -1;
      },
      Q: function(r, n) {
        try {
          return (r = gr.getStr(r)), gr.doAccess(r, n);
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      A: function(r, n, e) {
        gr.varargs = e;
        try {
          var t = gr.getStreamFromFD(r);
          switch (n) {
            case 0:
              return (o = gr.get()) < 0
                ? -28
                : yr.open(t.path, t.flags, 0, o).fd;
            case 1:
            case 2:
              return 0;
            case 3:
              return t.flags;
            case 4:
              var o = gr.get();
              return (t.flags |= o), 0;
            case 12:
              return (o = gr.get()), (P[(o + 0) >> 1] = 2), 0;
            case 13:
            case 14:
              return 0;
            case 16:
            case 8:
              return -28;
            case 9:
              return dr(28), -1;
            default:
              return -28;
          }
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      P: function(r, n) {
        try {
          var e = gr.getStreamFromFD(r);
          return gr.doStat(yr.stat, e.path, n);
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      q: function() {
        return 42;
      },
      W: function(r, n, e) {
        gr.varargs = e;
        try {
          var t = gr.getStreamFromFD(r);
          switch (n) {
            case 21509:
            case 21505:
              return t.tty ? 0 : -59;
            case 21510:
            case 21511:
            case 21512:
            case 21506:
            case 21507:
            case 21508:
              return t.tty ? 0 : -59;
            case 21519:
              if (!t.tty) return -59;
              var o = gr.get();
              return (T[o >> 2] = 0), 0;
            case 21520:
              return t.tty ? -28 : -59;
            case 21531:
              return (o = gr.get()), yr.ioctl(t, n, o);
            case 21523:
            case 21524:
              return t.tty ? 0 : -59;
            default:
              er("bad ioctl syscall " + n);
          }
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      Y: function(r, n, e, t, o, i) {
        try {
          return (function(r, n, e, t, o, i) {
            var a;
            i <<= 12;
            var u = !1;
            if (0 != (16 & t) && r % 16384 != 0) return -28;
            if (0 != (32 & t)) {
              if (!(a = cn(16384, n))) return -48;
              sn(a, 0, n), (u = !0);
            } else {
              var s = yr.getStream(o);
              if (!s) return -8;
              var c = yr.mmap(s, r, n, i, e, t);
              (a = c.ptr), (u = c.allocated);
            }
            return (
              (gr.mappings[a] = {
                malloc: a,
                len: n,
                allocated: u,
                fd: o,
                prot: e,
                flags: t,
                offset: i
              }),
              a
            );
          })(r, n, e, t, o, i);
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      X: function(r, n) {
        try {
          return (function(r, n) {
            if (-1 == (0 | r) || 0 === n) return -28;
            var e = gr.mappings[r];
            if (!e) return 0;
            if (n === e.len) {
              var t = yr.getStream(e.fd);
              2 & e.prot && gr.doMsync(r, t, n, e.flags, e.offset),
                yr.munmap(t),
                (gr.mappings[r] = null),
                e.allocated && an(e.malloc);
            }
            return 0;
          })(r, n);
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      v: function(r, n, e) {
        gr.varargs = e;
        try {
          var t = gr.getStr(r),
            o = gr.get();
          return yr.open(t, n, o).fd;
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      R: function(r, n, e) {
        try {
          var t = gr.getStreamFromFD(r);
          return yr.read(t, S, n, e);
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      O: function(r, n) {
        try {
          return (r = gr.getStr(r)), gr.doStat(yr.stat, r, n);
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      U: function(r) {
        try {
          return (r = gr.getStr(r)), yr.unlink(r), 0;
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), -r.errno
          );
        }
      },
      _: function(r, n, e, t, o) {
        var i = wr(e);
        Tr(r, {
          name: (n = _r(n)),
          fromWireType: function(r) {
            return !!r;
          },
          toWireType: function(r, n) {
            return n ? t : o;
          },
          argPackAdvance: 8,
          readValueFromPointer: function(r) {
            var t;
            if (1 === e) t = S;
            else if (2 === e) t = P;
            else {
              if (4 !== e)
                throw new TypeError("Unknown boolean type size: " + n);
              t = T;
            }
            return this.fromWireType(t[r >> i]);
          },
          destructorFunction: null
        });
      },
      Z: function(r, n) {
        Tr(r, {
          name: (n = _r(n)),
          fromWireType: function(r) {
            var n = xr[r].value;
            return (
              (function(r) {
                r > 4 &&
                  0 == --xr[r].refcount &&
                  ((xr[r] = void 0), Mr.push(r));
              })(r),
              n
            );
          },
          toWireType: function(r, n) {
            return (function(r) {
              switch (r) {
                case void 0:
                  return 1;
                case null:
                  return 2;
                case !0:
                  return 3;
                case !1:
                  return 4;
                default:
                  var n = Mr.length ? Mr.pop() : xr.length;
                  return (xr[n] = { refcount: 1, value: r }), n;
              }
            })(n);
          },
          argPackAdvance: 8,
          readValueFromPointer: Or,
          destructorFunction: null
        });
      },
      B: function(r, n, e) {
        var t = wr(e);
        Tr(r, {
          name: (n = _r(n)),
          fromWireType: function(r) {
            return r;
          },
          toWireType: function(r, n) {
            if ("number" != typeof n && "boolean" != typeof n)
              throw new TypeError(
                'Cannot convert "' + zr(n) + '" to ' + this.name
              );
            return n;
          },
          argPackAdvance: 8,
          readValueFromPointer: Nr(n, t),
          destructorFunction: null
        });
      },
      s: function(n, e, t, o, i, a) {
        var u = (function(r, n) {
          for (var e = [], t = 0; t < r; t++) e.push(T[(n >> 2) + t]);
          return e;
        })(e, t);
        (n = _r(n)),
          (i = (function(n, e) {
            n = _r(n);
            var t,
              o,
              i = r["dynCall_" + n],
              a =
                ((t = i),
                (o = [e]),
                function() {
                  o.length = arguments.length + 1;
                  for (var r = 0; r < arguments.length; r++)
                    o[r + 1] = arguments[r];
                  return t.apply(null, o);
                });
            return (
              "function" != typeof a &&
                Cr("unknown function pointer with signature " + n + ": " + e),
              a
            );
          })(o, i)),
          Ir(
            n,
            function() {
              !(function(r, n) {
                var e = [],
                  t = {};
                throw (n.forEach(function r(n) {
                  t[n] ||
                    br[n] ||
                    (Dr[n] ? Dr[n].forEach(r) : (e.push(n), (t[n] = !0)));
                }),
                new Wr(r + ": " + e.map(Lr).join([", "])));
              })("Cannot call " + n + " due to unbound types", u);
            },
            e - 1
          ),
          (function(r, n, e) {
            function t(n) {
              var t = e(n);
              t.length !== r.length && Ar("Mismatched type converter count");
              for (var o = 0; o < r.length; ++o) Tr(r[o], t[o]);
            }
            r.forEach(function(r) {
              Dr[r] = n;
            });
            var o = new Array(n.length),
              i = [],
              a = 0;
            n.forEach(function(r, n) {
              br.hasOwnProperty(r)
                ? (o[n] = br[r])
                : (i.push(r),
                  kr.hasOwnProperty(r) || (kr[r] = []),
                  kr[r].push(function() {
                    (o[n] = br[r]), ++a === i.length && t(o);
                  }));
            }),
              0 === i.length && t(o);
          })([], u, function(t) {
            var o = [t[0], null].concat(t.slice(1));
            return (
              (function(n, e, t) {
                r.hasOwnProperty(n) ||
                  Ar("Replacing nonexistant public symbol"),
                  void 0 !== r[n].overloadTable && void 0 !== t
                    ? (r[n].overloadTable[t] = e)
                    : ((r[n] = e), (r[n].argCount = t));
              })(
                n,
                (function(r, n, e, t, o) {
                  var i = n.length;
                  i < 2 &&
                    Cr(
                      "argTypes array size mismatch! Must at least get return value and 'this' types!"
                    );
                  for (
                    var a = null !== n[1] && null !== e, u = !1, s = 1;
                    s < n.length;
                    ++s
                  )
                    if (null !== n[s] && void 0 === n[s].destructorFunction) {
                      u = !0;
                      break;
                    }
                  var c = "void" !== n[0].name,
                    l = i - 2,
                    f = new Array(l),
                    d = [],
                    m = [];
                  return function() {
                    var e;
                    arguments.length !== l &&
                      Cr(
                        "function " +
                          r +
                          " called with " +
                          arguments.length +
                          " arguments, expected " +
                          l +
                          " args!"
                      ),
                      (m.length = 0),
                      (d.length = a ? 2 : 1),
                      (d[0] = o),
                      a && ((e = n[1].toWireType(m, this)), (d[1] = e));
                    for (var i = 0; i < l; ++i)
                      (f[i] = n[i + 2].toWireType(m, arguments[i])),
                        d.push(f[i]);
                    var s = t.apply(null, d);
                    if (u) Br(m);
                    else
                      for (i = a ? 1 : 2; i < n.length; i++) {
                        var p = 1 === i ? e : f[i - 2];
                        null !== n[i].destructorFunction &&
                          n[i].destructorFunction(p);
                      }
                    if (c) return n[0].fromWireType(s);
                  };
                })(n, o, null, i, a),
                e - 1
              ),
              []
            );
          });
      },
      k: function(r, n, e, t, o) {
        (n = _r(n)), -1 === o && (o = 4294967295);
        var i = wr(e),
          a = function(r) {
            return r;
          };
        if (0 === t) {
          var u = 32 - 8 * e;
          a = function(r) {
            return (r << u) >>> u;
          };
        }
        var s = -1 != n.indexOf("unsigned");
        Tr(r, {
          name: n,
          fromWireType: a,
          toWireType: function(r, e) {
            if ("number" != typeof e && "boolean" != typeof e)
              throw new TypeError(
                'Cannot convert "' + zr(e) + '" to ' + this.name
              );
            if (e < t || e > o)
              throw new TypeError(
                'Passing a number "' +
                  zr(e) +
                  '" from JS side to C/C++ side to an argument of type "' +
                  n +
                  '", which is outside the valid range [' +
                  t +
                  ", " +
                  o +
                  "]!"
              );
            return s ? e >>> 0 : 0 | e;
          },
          argPackAdvance: 8,
          readValueFromPointer: Ur(n, i, 0 !== t),
          destructorFunction: null
        });
      },
      i: function(r, n, e) {
        var t = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array
        ][n];
        function o(r) {
          var n = M,
            e = n[(r >>= 2)],
            o = n[r + 1];
          return new t(F, o, e);
        }
        Tr(
          r,
          {
            name: (e = _r(e)),
            fromWireType: o,
            argPackAdvance: 8,
            readValueFromPointer: o
          },
          { ignoreDuplicateRegistrations: !0 }
        );
      },
      C: function(r, n) {
        var e = "std::string" === (n = _r(n));
        Tr(r, {
          name: n,
          fromWireType: function(r) {
            var n,
              t = M[r >> 2];
            if (e)
              for (var o = r + 4, i = 0; i <= t; ++i) {
                var a = r + 4 + i;
                if (i == t || 0 == C[a]) {
                  var u = _(o, a - o);
                  void 0 === n
                    ? (n = u)
                    : ((n += String.fromCharCode(0)), (n += u)),
                    (o = a + 1);
                }
              }
            else {
              var s = new Array(t);
              for (i = 0; i < t; ++i) s[i] = String.fromCharCode(C[r + 4 + i]);
              n = s.join("");
            }
            return an(r), n;
          },
          toWireType: function(r, n) {
            n instanceof ArrayBuffer && (n = new Uint8Array(n));
            var t = "string" == typeof n;
            t ||
              n instanceof Uint8Array ||
              n instanceof Uint8ClampedArray ||
              n instanceof Int8Array ||
              Cr("Cannot pass non-string to std::string");
            var o = (e && t
                ? function() {
                    return D(n);
                  }
                : function() {
                    return n.length;
                  })(),
              i = on(4 + o + 1);
            if (((M[i >> 2] = o), e && t)) b(n, i + 4, o + 1);
            else if (t)
              for (var a = 0; a < o; ++a) {
                var u = n.charCodeAt(a);
                u > 255 &&
                  (an(i),
                  Cr("String has UTF-16 code units that do not fit in 8 bits")),
                  (C[i + 4 + a] = u);
              }
            else for (a = 0; a < o; ++a) C[i + 4 + a] = n[a];
            return null !== r && r.push(an, i), i;
          },
          argPackAdvance: 8,
          readValueFromPointer: Or,
          destructorFunction: function(r) {
            an(r);
          }
        });
      },
      w: function(r, n, e) {
        var t, o, i, a, u;
        (e = _r(e)),
          2 === n
            ? ((t = O),
              (o = z),
              (a = N),
              (i = function() {
                return A;
              }),
              (u = 1))
            : 4 === n &&
              ((t = B),
              (o = I),
              (a = W),
              (i = function() {
                return M;
              }),
              (u = 2)),
          Tr(r, {
            name: e,
            fromWireType: function(r) {
              for (
                var e, o = M[r >> 2], a = i(), s = r + 4, c = 0;
                c <= o;
                ++c
              ) {
                var l = r + 4 + c * n;
                if (c == o || 0 == a[l >> u]) {
                  var f = t(s, l - s);
                  void 0 === e
                    ? (e = f)
                    : ((e += String.fromCharCode(0)), (e += f)),
                    (s = l + n);
                }
              }
              return an(r), e;
            },
            toWireType: function(r, t) {
              "string" != typeof t &&
                Cr("Cannot pass non-string to C++ string type " + e);
              var i = a(t),
                s = on(4 + i + n);
              return (
                (M[s >> 2] = i >> u),
                o(t, s + 4, i + n),
                null !== r && r.push(an, s),
                s
              );
            },
            argPackAdvance: 8,
            readValueFromPointer: Or,
            destructorFunction: function(r) {
              an(r);
            }
          });
      },
      $: function(r, n) {
        Tr(r, {
          isVoid: !0,
          name: (n = _r(n)),
          argPackAdvance: 0,
          fromWireType: function() {},
          toWireType: function(r, n) {}
        });
      },
      x: function() {
        er();
      },
      G: function(r, n, e) {
        var t = (function(r, n) {
          var e;
          for ($r.length = 0, n >>= 2; (e = C[r++]); ) {
            var t = e < 105;
            t && 1 & n && n++, $r.push(t ? j[n++ >> 1] : T[n]), ++n;
          }
          return $r;
        })(n, e);
        return lr[r].apply(null, t);
      },
      d: function(r, n) {
        !(function(r, n) {
          throw (fn(r, n || 1), "longjmp");
        })(r, n);
      },
      I: function(r, n, e) {
        C.copyWithin(r, n, n + e);
      },
      J: function(r) {
        r >>>= 0;
        var n = C.length;
        if (r > 2147483648) return !1;
        for (var e, t, o = 1; o <= 4; o *= 2) {
          var i = n * (1 + 0.2 / o);
          if (
            ((i = Math.min(i, r + 100663296)),
            Hr(
              Math.min(
                2147483648,
                ((e = Math.max(16777216, r, i)) % (t = 65536) > 0 &&
                  (e += t - (e % t)),
                e)
              )
            ))
          )
            return !0;
        }
        return !1;
      },
      M: function(r, n) {
        var e = 0;
        return (
          qr().forEach(function(t, o) {
            var i = n + e;
            (T[(r + 4 * o) >> 2] = i),
              (function(r, n, e) {
                for (var t = 0; t < r.length; ++t)
                  S[n++ >> 0] = r.charCodeAt(t);
                e || (S[n >> 0] = 0);
              })(t, i),
              (e += t.length + 1);
          }),
          0
        );
      },
      N: function(r, n) {
        var e = qr();
        T[r >> 2] = e.length;
        var t = 0;
        return (
          e.forEach(function(r) {
            t += r.length + 1;
          }),
          (T[n >> 2] = t),
          0
        );
      },
      j: function(n) {
        !(function(n, e) {
          (e && m && 0 === n) ||
            (m || ((y = !0), r.onExit && r.onExit(n)), s(n, new Pn(n)));
        })(n);
      },
      r: function(r) {
        try {
          var n = gr.getStreamFromFD(r);
          return yr.close(n), 0;
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), r.errno
          );
        }
      },
      L: function(r, n) {
        try {
          var e = gr.getStreamFromFD(r),
            t = e.tty ? 2 : yr.isDir(e.mode) ? 3 : yr.isLink(e.mode) ? 7 : 4;
          return (S[n >> 0] = t), 0;
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), r.errno
          );
        }
      },
      T: function(r, n, e, t) {
        try {
          var o = gr.getStreamFromFD(r),
            i = gr.doReadv(o, n, e);
          return (T[t >> 2] = i), 0;
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), r.errno
          );
        }
      },
      H: function(r, n, e, t, o) {
        try {
          var i = gr.getStreamFromFD(r),
            a = 4294967296 * e + (n >>> 0);
          return a <= -9007199254740992 || a >= 9007199254740992
            ? -61
            : (yr.llseek(i, a, t),
              (ar = [
                i.position >>> 0,
                ((ir = i.position),
                +G(ir) >= 1
                  ? ir > 0
                    ? (0 | Z(+J(ir / 4294967296), 4294967295)) >>> 0
                    : ~~+K((ir - +(~~ir >>> 0)) / 4294967296) >>> 0
                  : 0)
              ]),
              (T[o >> 2] = ar[0]),
              (T[(o + 4) >> 2] = ar[1]),
              i.getdents && 0 === a && 0 === t && (i.getdents = null),
              0);
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), r.errno
          );
        }
      },
      u: function(r, n, e, t) {
        try {
          var o = gr.getStreamFromFD(r),
            i = gr.doWritev(o, n, e);
          return (T[t >> 2] = i), 0;
        } catch (r) {
          return (
            (void 0 !== yr && r instanceof yr.ErrnoError) || er(r), r.errno
          );
        }
      },
      b: function() {
        return 0 | h;
      },
      aa: function(r) {
        var n = Date.now();
        return (
          (T[r >> 2] = (n / 1e3) | 0),
          (T[(r + 4) >> 2] = ((n % 1e3) * 1e3) | 0),
          0
        );
      },
      ca: function(r) {
        var n = dn();
        try {
          return Sn(r);
        } catch (r) {
          if ((mn(n), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      da: function(r, n) {
        var e = dn();
        try {
          return Cn(r, n);
        } catch (r) {
          if ((mn(e), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      E: function(r) {
        var n = dn();
        try {
          return En(r);
        } catch (r) {
          if ((mn(n), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      h: function(r, n) {
        var e = dn();
        try {
          return _n(r, n);
        } catch (r) {
          if ((mn(e), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      e: function(r, n, e) {
        var t = dn();
        try {
          return kn(r, n, e);
        } catch (r) {
          if ((mn(t), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      f: function(r, n, e, t) {
        var o = dn();
        try {
          return bn(r, n, e, t);
        } catch (r) {
          if ((mn(o), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      o: function(r, n, e, t, o) {
        var i = dn();
        try {
          return Dn(r, n, e, t, o);
        } catch (r) {
          if ((mn(i), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      ba: function(r, n, e, t, o, i, a) {
        var u = dn();
        try {
          return Fn(r, n, e, t, o, i, a);
        } catch (r) {
          if ((mn(u), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      l: function(r) {
        var n = dn();
        try {
          pn(r);
        } catch (r) {
          if ((mn(n), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      g: function(r, n) {
        var e = dn();
        try {
          hn(r, n);
        } catch (r) {
          if ((mn(e), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      p: function(r, n, e) {
        var t = dn();
        try {
          vn(r, n, e);
        } catch (r) {
          if ((mn(t), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      z: function(r, n, e, t) {
        var o = dn();
        try {
          yn(r, n, e, t);
        } catch (r) {
          if ((mn(o), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      y: function(r, n, e, t, o) {
        var i = dn();
        try {
          gn(r, n, e, t, o);
        } catch (r) {
          if ((mn(i), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      t: function(r, n, e, t, o, i) {
        var a = dn();
        try {
          wn(r, n, e, t, o, i);
        } catch (r) {
          if ((mn(a), r !== r + 0 && "longjmp" !== r)) throw r;
          fn(1, 0);
        }
      },
      memory: p,
      c: function(r) {
        h = 0 | r;
      },
      K: function(r, n, e, t) {
        return Zr(r, n, e, t);
      },
      table: v,
      F: function(r) {
        var n = (Date.now() / 1e3) | 0;
        return r && (T[r >> 2] = n), n;
      },
      D: function(r) {
        return 0 !== r && sn(r, 0, 16), 0;
      }
    },
    tn =
      ((function() {
        var n = { a: en };
        function e(n, e) {
          var t = n.exports;
          (r.asm = t), nr();
        }
        function t(r) {
          e(r.instance);
        }
        function o(r) {
          return (d || "function" != typeof fetch
            ? new Promise(function(r, n) {
                r(sr());
              })
            : fetch(ur, { credentials: "same-origin" })
                .then(function(r) {
                  if (!r.ok)
                    throw "failed to load wasm binary file at '" + ur + "'";
                  return r.arrayBuffer();
                })
                .catch(function() {
                  return sr();
                })
          )
            .then(function(r) {
              return WebAssembly.instantiate(r, n);
            })
            .then(r, function(r) {
              f("failed to asynchronously prepare wasm: " + r), er(r);
            });
        }
        if ((rr(), r.instantiateWasm))
          try {
            return r.instantiateWasm(n, e);
          } catch (r) {
            return (
              f("Module.instantiateWasm callback failed with error: " + r), !1
            );
          }
        !(function() {
          if (
            d ||
            "function" != typeof WebAssembly.instantiateStreaming ||
            tr(ur) ||
            "function" != typeof fetch
          )
            return o(t);
          fetch(ur, { credentials: "same-origin" }).then(function(r) {
            return WebAssembly.instantiateStreaming(r, n).then(t, function(r) {
              return (
                f("wasm streaming compile failed: " + r),
                f("falling back to ArrayBuffer instantiation"),
                o(t)
              );
            });
          });
        })();
      })(),
      (r.___wasm_call_ctors = function() {
        return (tn = r.___wasm_call_ctors = r.asm.ea).apply(null, arguments);
      })),
    on = (r._malloc = function() {
      return (on = r._malloc = r.asm.fa).apply(null, arguments);
    }),
    an = (r._free = function() {
      return (an = r._free = r.asm.ga).apply(null, arguments);
    }),
    un = (r.___errno_location = function() {
      return (un = r.___errno_location = r.asm.ha).apply(null, arguments);
    }),
    sn = (r._memset = function() {
      return (sn = r._memset = r.asm.ia).apply(null, arguments);
    }),
    cn = (r._memalign = function() {
      return (cn = r._memalign = r.asm.ja).apply(null, arguments);
    }),
    ln = (r.___getTypeName = function() {
      return (ln = r.___getTypeName = r.asm.ka).apply(null, arguments);
    }),
    fn =
      ((r.___embind_register_native_and_builtin_types = function() {
        return (r.___embind_register_native_and_builtin_types = r.asm.la).apply(
          null,
          arguments
        );
      }),
      (r._setThrew = function() {
        return (fn = r._setThrew = r.asm.ma).apply(null, arguments);
      })),
    dn = (r.stackSave = function() {
      return (dn = r.stackSave = r.asm.na).apply(null, arguments);
    }),
    mn = (r.stackRestore = function() {
      return (mn = r.stackRestore = r.asm.oa).apply(null, arguments);
    }),
    pn = (r.dynCall_v = function() {
      return (pn = r.dynCall_v = r.asm.pa).apply(null, arguments);
    }),
    hn = (r.dynCall_vi = function() {
      return (hn = r.dynCall_vi = r.asm.qa).apply(null, arguments);
    }),
    vn = (r.dynCall_vii = function() {
      return (vn = r.dynCall_vii = r.asm.ra).apply(null, arguments);
    }),
    yn = (r.dynCall_viii = function() {
      return (yn = r.dynCall_viii = r.asm.sa).apply(null, arguments);
    }),
    gn = (r.dynCall_viiii = function() {
      return (gn = r.dynCall_viiii = r.asm.ta).apply(null, arguments);
    }),
    wn = (r.dynCall_viiiii = function() {
      return (wn = r.dynCall_viiiii = r.asm.ua).apply(null, arguments);
    }),
    En = (r.dynCall_i = function() {
      return (En = r.dynCall_i = r.asm.va).apply(null, arguments);
    }),
    _n = (r.dynCall_ii = function() {
      return (_n = r.dynCall_ii = r.asm.wa).apply(null, arguments);
    }),
    kn = (r.dynCall_iii = function() {
      return (kn = r.dynCall_iii = r.asm.xa).apply(null, arguments);
    }),
    bn = (r.dynCall_iiii = function() {
      return (bn = r.dynCall_iiii = r.asm.ya).apply(null, arguments);
    }),
    Dn = (r.dynCall_iiiii = function() {
      return (Dn = r.dynCall_iiiii = r.asm.za).apply(null, arguments);
    }),
    Fn = (r.dynCall_iiiiiii = function() {
      return (Fn = r.dynCall_iiiiiii = r.asm.Aa).apply(null, arguments);
    }),
    Sn = (r.dynCall_d = function() {
      return (Sn = r.dynCall_d = r.asm.Ba).apply(null, arguments);
    }),
    Cn = (r.dynCall_di = function() {
      return (Cn = r.dynCall_di = r.asm.Ca).apply(null, arguments);
    });
  function Pn(r) {
    (this.name = "ExitStatus"),
      (this.message = "Program terminated with exit(" + r + ")"),
      (this.status = r);
  }
  function An(e) {
    function t() {
      nn ||
        ((nn = !0),
        (r.calledRun = !0),
        y ||
          (r.noFSInit || yr.init.initialized || yr.init(),
          hr.init(),
          H(q),
          (yr.ignorePermissions = !1),
          H(V),
          n(r),
          r.onRuntimeInitialized && r.onRuntimeInitialized(),
          (function() {
            if (r.postRun)
              for (
                "function" == typeof r.postRun && (r.postRun = [r.postRun]);
                r.postRun.length;

              )
                (n = r.postRun.shift()), X.unshift(n);
            var n;
            H(X);
          })()));
    }
    $ > 0 ||
      ((function() {
        if (r.preRun)
          for (
            "function" == typeof r.preRun && (r.preRun = [r.preRun]);
            r.preRun.length;

          )
            (n = r.preRun.shift()), Y.unshift(n);
        var n;
        H(Y);
      })(),
      $ > 0 ||
        (r.setStatus
          ? (r.setStatus("Running..."),
            setTimeout(function() {
              setTimeout(function() {
                r.setStatus("");
              }, 1),
                t();
            }, 1))
          : t()));
  }
  if (
    ((r.dynCall_viiiiii = function() {
      return (r.dynCall_viiiiii = r.asm.Da).apply(null, arguments);
    }),
    (r.dynCall_iiiff = function() {
      return (r.dynCall_iiiff = r.asm.Ea).apply(null, arguments);
    }),
    (r.dynCall_viijii = function() {
      return (r.dynCall_viijii = r.asm.Fa).apply(null, arguments);
    }),
    (r.dynCall_iiiiii = function() {
      return (r.dynCall_iiiiii = r.asm.Ga).apply(null, arguments);
    }),
    (r.dynCall_iiij = function() {
      return (r.dynCall_iiij = r.asm.Ha).apply(null, arguments);
    }),
    (r.dynCall_viij = function() {
      return (r.dynCall_viij = r.asm.Ia).apply(null, arguments);
    }),
    (r.dynCall_viiiddi = function() {
      return (r.dynCall_viiiddi = r.asm.Ja).apply(null, arguments);
    }),
    (r.dynCall_dddd = function() {
      return (r.dynCall_dddd = r.asm.Ka).apply(null, arguments);
    }),
    (r.dynCall_iji = function() {
      return (r.dynCall_iji = r.asm.La).apply(null, arguments);
    }),
    (r.dynCall_iiiiiiiiiii = function() {
      return (r.dynCall_iiiiiiiiiii = r.asm.Ma).apply(null, arguments);
    }),
    (r.dynCall_jiji = function() {
      return (r.dynCall_jiji = r.asm.Na).apply(null, arguments);
    }),
    (r.dynCall_iidiiii = function() {
      return (r.dynCall_iidiiii = r.asm.Oa).apply(null, arguments);
    }),
    (r.dynCall_iiiiiiiii = function() {
      return (r.dynCall_iiiiiiiii = r.asm.Pa).apply(null, arguments);
    }),
    (r.dynCall_iiiiij = function() {
      return (r.dynCall_iiiiij = r.asm.Qa).apply(null, arguments);
    }),
    (r.dynCall_iiiiid = function() {
      return (r.dynCall_iiiiid = r.asm.Ra).apply(null, arguments);
    }),
    (r.dynCall_iiiiijj = function() {
      return (r.dynCall_iiiiijj = r.asm.Sa).apply(null, arguments);
    }),
    (r.dynCall_iiiiiiii = function() {
      return (r.dynCall_iiiiiiii = r.asm.Ta).apply(null, arguments);
    }),
    (r.dynCall_iiiiiijj = function() {
      return (r.dynCall_iiiiiijj = r.asm.Ua).apply(null, arguments);
    }),
    (Q = function r() {
      nn || An(), nn || (Q = r);
    }),
    (r.run = An),
    r.preInit)
  )
    for (
      "function" == typeof r.preInit && (r.preInit = [r.preInit]);
      r.preInit.length > 0;

    )
      r.preInit.pop()();
  return (m = !0), An(), r.ready;
};
let n, e, t;
function o(n) {
  const { id: o, src: i, options: a } = n.data;
  return (async function() {
    return void 0 === t && (t = await e.then(r)), t;
  })()
    .then(r => {
      const n = (function(r, n, e) {
        for (const { path: n, data: t } of e.files) r.vizCreateFile(n, t);
        r.vizSetY_invert(e.yInvert ? 1 : 0), r.vizSetNop(e.nop || 0);
        const t = r.vizRenderFromString(n, e.format, e.engine),
          o = r.vizLastErrorMessage();
        if ("" !== o) throw new Error(o);
        return t;
      })(r, i, a);
      postMessage({ id: o, result: n });
    })
    .catch(r => {
      const n =
        r instanceof Error
          ? {
              message: r.message,
              fileName: r.fileName,
              lineNumber: r.lineNumber
            }
          : { message: r.toString() };
      postMessage({ id: o, error: n });
    });
}
(e = Promise.resolve({})),
  (n = r => (e = Promise.resolve(r))),
  addEventListener("message", o);
var i = n;

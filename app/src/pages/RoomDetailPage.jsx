import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TileSkeleton } from "../components/ui/Skeleton";
import { endpoints } from "../services/endpoints";
import { useLang } from "../contexts/LanguageContext";

/* ================================================================
   Virtual filesystem — real cd/ls/pwd/cat navigation
   ================================================================ */
const HOME = "/root/lab";

function buildFs() {
  return {
    type: "dir",
    children: {
      root: { type: "dir", children: {
        lab: { type: "dir", children: {
          "README.txt": { type: "file", content: [
            "Welcome to the Xakker pentest lab.",
            "This shell has a real (in-memory) filesystem — cd, ls, cat all work.",
            "Type 'help' for the full command list.",
          ] },
          recon: { type: "dir", children: {
            "notes.txt": { type: "file", content: [
              "TODO: enumerate open ports on the target",
              "TODO: brute-force hidden directories",
              "TODO: check /admin panel for weak creds",
            ] },
          } },
          www: { type: "dir", children: {
            "index.php": { type: "file", content: [
              "<?php", "  include 'config.php';", "  echo '<h1>Xakker Corp</h1>';", "?>",
            ] },
            "config.php": { type: "file", content: [
              "<?php", "  $db_host = 'localhost';", "  $db_user = 'admin';", "  $db_pass = '********';", "?>",
            ] },
            uploads: { type: "dir", children: {} },
          } },
        } },
      } },
      etc: { type: "dir", children: {
        passwd: { type: "file", content: [
          "root:x:0:0:root:/root:/bin/bash",
          "daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin",
          "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
          "ctfuser:x:1000:1000:CTF User:/home/ctfuser:/bin/bash",
          "mysql:x:999:999:MySQL Server:/nonexistent:/bin/false",
        ] },
        hostname: { type: "file", content: ["xakker"] },
      } },
      home: { type: "dir", children: {
        ctfuser: { type: "dir", children: {
          "user.txt": { type: "file", content: ["xkr{us3r_fl4g_pwn3d}"] },
        } },
      } },
      var: { type: "dir", children: {
        www: { type: "dir", children: {
          html: { type: "dir", children: {
            "index.php": { type: "file", content: ["<html><body><h1>Xakker Corp — CTF Lab v2.0</h1></body></html>"] },
          } },
        } },
      } },
    },
  };
}

function resolvePath(cwd, inputRaw) {
  let input = inputRaw;
  let segs;
  if (input.startsWith("~")) {
    segs = HOME.split("/").filter(Boolean);
    input = input.slice(1);
    if (input.startsWith("/")) input = input.slice(1);
  } else if (input.startsWith("/")) {
    segs = [];
    input = input.slice(1);
  } else {
    segs = cwd.split("/").filter(Boolean);
  }
  for (const p of input.split("/").filter(Boolean)) {
    if (p === ".") continue;
    else if (p === "..") segs.pop();
    else segs.push(p);
  }
  return "/" + segs.join("/");
}
function getNode(fsRoot, absPath) {
  const segs = absPath.split("/").filter(Boolean);
  let node = fsRoot;
  for (const s of segs) {
    if (!node || node.type !== "dir" || !node.children[s]) return null;
    node = node.children[s];
  }
  return node;
}
function displayPath(absPath) {
  if (absPath === HOME) return "~";
  if (absPath.startsWith(HOME + "/")) return "~" + absPath.slice(HOME.length);
  return absPath;
}

/* ================================================================
   Terminal command simulation engine
   ================================================================ */
function helpLines() {
  return [
    { t: "info",  v: "Available commands:" },
    { t: "",      v: "" },
    { t: "info",  v: "  Filesystem" },
    { t: "",      v: "  ls / cd / pwd / cat        — Filesystem navigation" },
    { t: "",      v: "  mkdir / touch              — Create a directory / file" },
    { t: "",      v: "  rm / cp / mv               — Remove / copy / move" },
    { t: "",      v: "  chmod / chown              — Change permissions / ownership" },
    { t: "",      v: "  find / -perm -4000         — Find SUID files" },
    { t: "",      v: "  grep <pattern> <file>      — Search text" },
    { t: "",      v: "  head / tail <file>         — Show first / last lines" },
    { t: "",      v: "  wc <file>                  — Count lines/words/bytes" },
    { t: "",      v: "  echo <text>                — Print text" },
    { t: "",      v: "" },
    { t: "info",  v: "  Network / Recon" },
    { t: "",      v: "  ifconfig / ip a            — Show network interfaces" },
    { t: "",      v: "  ping <host>                — ICMP echo request" },
    { t: "",      v: "  netstat / ss                — Show network connections" },
    { t: "",      v: "  wget <url>                 — Download a file" },
    { t: "",      v: "  curl <url>                 — HTTP request" },
    { t: "",      v: "  ssh <user@host>            — Secure shell connect" },
    { t: "",      v: "  ssh-keygen                 — Generate an SSH keypair" },
    { t: "",      v: "  nc / netcat <ip> <port>    — Netcat connect / listener" },
    { t: "",      v: "  nmap -sV <ip>              — Port scan + service versions" },
    { t: "",      v: "  gobuster dir -u <url>      — Web directory brute-force" },
    { t: "",      v: "  dirb <url>                 — Web content scanner" },
    { t: "",      v: "  nikto -h <url>             — Web server vulnerability scan" },
    { t: "",      v: "  whatweb <url>              — Web fingerprinting" },
    { t: "",      v: "" },
    { t: "info",  v: "  Exploitation" },
    { t: "",      v: "  hydra -l user -P wl        — Brute-force login" },
    { t: "",      v: "  sqlmap -u <url>            — Automated SQL injection" },
    { t: "",      v: "  john <file>                — Password hash cracking" },
    { t: "",      v: "  searchsploit <term>        — Search exploit-db" },
    { t: "",      v: "  msfconsole                 — Metasploit Framework console" },
    { t: "",      v: "  python3 -c '<code>'        — Run inline Python (privesc chain)" },
    { t: "",      v: "" },
    { t: "info",  v: "  System" },
    { t: "",      v: "  whoami / id / uname        — System info" },
    { t: "",      v: "  ps / top / htop            — Process list / snapshot" },
    { t: "",      v: "  env / export               — Environment variables" },
    { t: "",      v: "  which <cmd>                — Locate a command" },
    { t: "",      v: "  man <cmd>                  — Manual page (short)" },
    { t: "",      v: "  date / uptime              — Date/time, uptime" },
    { t: "",      v: "  df / du                    — Disk usage" },
    { t: "",      v: "  history                    — Command history" },
    { t: "",      v: "  clear (Ctrl+L)             — Clear screen" },
    { t: "",      v: "  exit / logout              — Close the session" },
  ];
}

const SIM = [
  {
    test: c => c.startsWith("nmap"),
    run: (c) => {
      const sV = c.includes("-sv") || c.includes("-sc") || c.includes("-a");
      return [
        { t: "muted", v: "Starting Nmap 7.94 ( https://nmap.org ) at " + new Date().toLocaleTimeString() },
        { t: "",      v: "Nmap scan report for target (" + (c.match(/\d{1,3}(?:\.\d{1,3}){3}/)?.[0] || "TARGET") + ")" },
        { t: "",      v: "Host is up (0.032s latency)." },
        { t: "",      v: "" },
        { t: "",      v: "PORT     STATE SERVICE" + (sV ? " VERSION" : "") },
        { t: "",      v: "22/tcp   open  ssh"   + (sV ? "     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)" : "") },
        { t: "",      v: "80/tcp   open  http"  + (sV ? "    Apache httpd 2.4.52 ((Ubuntu))" : "") },
        { t: "",      v: "3306/tcp open  mysql" + (sV ? "   MySQL 8.0.32-0ubuntu0.22.04.2" : "") },
        { t: "",      v: "" },
        { t: sV ? "success" : "", v: sV ? "Service detection performed. NSE: Script Post-scanning." : "Nmap done: 1 IP address (1 host up) scanned." },
        { t: "success", v: "[ ✓ Open ports found: 22 (ssh), 80 (http), 3306 (mysql) ]" },
      ];
    },
  },
  {
    test: c => c.startsWith("gobuster"),
    run: () => [
      { t: "muted", v: "===============================================================" },
      { t: "info",  v: "Gobuster v3.6 — by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)" },
      { t: "muted", v: "===============================================================" },
      { t: "",      v: "[+] Starting gobuster in directory enumeration mode" },
      { t: "muted", v: "===============================================================" },
      { t: "",      v: "/index.php             (Status: 200) [Size: 2048]" },
      { t: "",      v: "/images                (Status: 301) [Size: 315]" },
      { t: "",      v: "/admin                 (Status: 301) [Size: 316]" },
      { t: "success", v: "/admin/login.php      (Status: 200) [Size: 1024]  ← FOUND" },
      { t: "",      v: "/uploads               (Status: 403) [Size: 279]" },
      { t: "",      v: "/config.php            (Status: 403) [Size: 279]" },
      { t: "success", v: "/backup/db.sql        (Status: 200) [Size: 48291] ← OPEN DATABASE!" },
      { t: "",      v: "" },
      { t: "success", v: "[ ✓ Admin login panel found: /admin/login.php ]" },
      { t: "success", v: "[ ✓ Open database dump found: /backup/db.sql   ]" },
    ],
  },
  {
    test: c => c.startsWith("curl"),
    run: (c) => {
      if (c.includes("admin")) return [
        { t: "muted", v: "< HTTP/1.1 200 OK" },
        { t: "muted", v: "< Server: Apache/2.4.52 (Ubuntu)" },
        { t: "muted", v: "< Content-Type: text/html; charset=UTF-8" },
        { t: "",      v: "" },
        { t: "",      v: "<!DOCTYPE html>" },
        { t: "",      v: "<html><head><title>Admin Panel — xLogin v2.1</title></head><body>" },
        { t: "",      v: "  <form method='POST' action='/admin/login.php'>" },
        { t: "",      v: "    <input name='username' type='text' placeholder='Username'/>" },
        { t: "",      v: "    <input name='password' type='password' placeholder='Password'/>" },
        { t: "",      v: "    <button type='submit'>Login</button>" },
        { t: "",      v: "  </form>" },
        { t: "",      v: "</body></html>" },
        { t: "",      v: "" },
        { t: "success", v: "[ ✓ Admin login form found → POST /admin/login.php ]" },
      ];
      return [
        { t: "muted", v: "< HTTP/1.1 200 OK" },
        { t: "muted", v: "< Server: Apache/2.4.52  X-Powered-By: PHP/8.1.12" },
        { t: "",      v: "" },
        { t: "",      v: "<html><body><h1>Xakker Corp — CTF Lab v2.0</h1></body></html>" },
      ];
    },
  },
  {
    test: c => c.startsWith("hydra"),
    run: () => [
      { t: "muted", v: "Hydra v9.4 (c) 2022 by van Hauser/THC & David Maciejak" },
      { t: "info",  v: "[DATA] max 16 tasks per 1 server" },
      { t: "info",  v: "[DATA] attacking http-post-form://target/admin/login.php" },
      { t: "",      v: "[80][http-post-form] host: target   login: admin   password: admin123         [FAIL]" },
      { t: "",      v: "[80][http-post-form] host: target   login: admin   password: password         [FAIL]" },
      { t: "",      v: "[80][http-post-form] host: target   login: admin   password: 123456           [FAIL]" },
      { t: "success", v: "[80][http-post-form] host: target   login: admin   password: P@ssw0rd2024   [SUCCESS]" },
      { t: "",      v: "" },
      { t: "muted", v: "1 of 1 target successfully completed, 1 valid password found" },
      { t: "success", v: "[ ✓ Credentials found: admin:P@ssw0rd2024 ]" },
    ],
  },
  {
    test: c => c.startsWith("sqlmap"),
    run: () => [
      { t: "muted", v: "        ___" },
      { t: "muted", v: "       __H__    sqlmap/1.7.9" },
      { t: "muted", v: "  ___ ___[(]_____ ___ ___  {1.7.9#stable}" },
      { t: "muted", v: " |_ -| . [,]     | .'| . |" },
      { t: "muted", v: " |___|_  [(]_|_|_|__,|  _|" },
      { t: "muted", v: "       |_|V...       |_|   https://sqlmap.org" },
      { t: "",      v: "" },
      { t: "info",  v: "[*] starting @ " + new Date().toLocaleTimeString() },
      { t: "",      v: "[*] testing connection to the target URL" },
      { t: "",      v: "[*] testing if the target URL content is stable" },
      { t: "",      v: "[*] testing 'AND boolean-based blind - WHERE or HAVING clause'" },
      { t: "success", v: "[*] GET parameter 'id' is vulnerable. Do you want to exploit? [Y/n] Y" },
      { t: "",      v: "[*] available databases [2]:" },
      { t: "",      v: "    [*] information_schema" },
      { t: "success", v: "    [*] xakker_ctf" },
      { t: "",      v: "[*] fetching tables for database: xakker_ctf" },
      { t: "",      v: "    [*] users" },
      { t: "",      v: "" },
      { t: "",      v: "+----+----------+----------------------------------+-------------------------------+" },
      { t: "",      v: "| id | username | password_hash                    | flag                          |" },
      { t: "",      v: "+----+----------+----------------------------------+-------------------------------+" },
      { t: "success", v: "| 1  | admin    | $2y$10$mXhAzP4g...             | xkr{SQL_1nj3ct10n_m4st3r}     |" },
      { t: "",      v: "+----+----------+----------------------------------+-------------------------------+" },
      { t: "",      v: "" },
      { t: "success", v: "[ ✓ SQL injection successful! Flag found: xkr{SQL_1nj3ct10n_m4st3r} ]" },
    ],
  },
  {
    test: c => c.startsWith("nc") || c.startsWith("netcat"),
    run: () => [
      { t: "info",    v: "Ncat: Version 7.94 ( https://nmap.org/ncat )" },
      { t: "info",    v: "Ncat: Listening on :::4444" },
      { t: "success", v: "Ncat: Connection from 10.10.11.42:49210." },
      { t: "",        v: "" },
      { t: "",        v: "whoami" },
      { t: "success", v: "www-data" },
      { t: "",        v: "id" },
      { t: "",        v: "uid=33(www-data) gid=33(www-data) groups=33(www-data)" },
      { t: "",        v: "cat /home/ctfuser/user.txt" },
      { t: "success", v: "xkr{us3r_fl4g_pwn3d}" },
      { t: "",        v: "" },
      { t: "success", v: "[ ✓ Reverse shell obtained! user.txt read. ]" },
    ],
  },
  {
    test: c => c.startsWith("find") && c.includes("perm"),
    run: () => [
      { t: "",        v: "/usr/bin/find" },
      { t: "success", v: "/usr/bin/python3.10" },
      { t: "",        v: "/usr/bin/pkexec" },
      { t: "",        v: "/usr/lib/dbus-1.0/dbus-daemon-launch-helper" },
      { t: "",        v: "" },
      { t: "success", v: "[ ✓ /usr/bin/python3.10 SUID — privilege escalation possible! ]" },
    ],
  },
  {
    test: c => c.startsWith("python") && c.includes("-c"),
    run: () => [
      { t: "success", v: "root@xakker:/var/www/html# " },
      { t: "success", v: "# whoami" },
      { t: "success", v: "root" },
      { t: "success", v: "[ ✓ Root shell obtained! Privilege escalation successful! ]" },
    ],
  },
  {
    test: c => c.startsWith("ifconfig") || c === "ip a" || c.startsWith("ip a") || c.startsWith("ip addr"),
    run: () => [
      { t: "info", v: "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500" },
      { t: "",     v: "        inet 10.10.11.42  netmask 255.255.255.0  broadcast 10.10.11.255" },
      { t: "",     v: "        ether 02:42:0a:0a:0b:2a  txqueuelen 0  (Ethernet)" },
      { t: "",     v: "        RX packets 4821  bytes 2091344 (2.0 MiB)" },
      { t: "",     v: "        TX packets 3120  bytes 611203 (596.8 KiB)" },
      { t: "",     v: "" },
      { t: "info", v: "lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536" },
      { t: "",     v: "        inet 127.0.0.1  netmask 255.0.0.0" },
    ],
  },
  {
    test: c => c.startsWith("ping"),
    run: (c) => {
      const target = c.match(/\d{1,3}(?:\.\d{1,3}){3}/)?.[0] || c.split(/\s+/)[1] || "target";
      return [
        { t: "",        v: `PING ${target} (${target}) 56(84) bytes of data.` },
        { t: "",        v: `64 bytes from ${target}: icmp_seq=1 ttl=63 time=0.041 ms` },
        { t: "",        v: `64 bytes from ${target}: icmp_seq=2 ttl=63 time=0.038 ms` },
        { t: "",        v: `64 bytes from ${target}: icmp_seq=3 ttl=63 time=0.044 ms` },
        { t: "",        v: "" },
        { t: "muted",   v: `--- ${target} ping statistics ---` },
        { t: "success", v: "3 packets transmitted, 3 received, 0% packet loss, time 2041ms" },
      ];
    },
  },
  {
    test: c => c.startsWith("wget"),
    run: (c) => {
      const url = c.split(/\s+/)[1] || "http://target/file";
      const file = url.split("/").pop() || "index.html";
      return [
        { t: "muted",   v: `--${new Date().toISOString()}--  ${url}` },
        { t: "",        v: "Resolving target... connected." },
        { t: "",        v: "HTTP request sent, awaiting response... 200 OK" },
        { t: "",        v: "Length: 48291 (47K) [application/octet-stream]" },
        { t: "success", v: `Saving to: '${file}'` },
        { t: "success", v: `${file}  100%[===================>]  47.16K  --.-KB/s    in 0.02s` },
        { t: "muted",   v: "'" + file + "' saved [48291/48291]" },
      ];
    },
  },
  {
    test: c => c.startsWith("ssh-keygen"),
    run: () => [
      { t: "",      v: "Generating public/private ed25519 key pair." },
      { t: "",      v: "Enter file in which to save the key (/root/.ssh/id_ed25519):" },
      { t: "",      v: "Your identification has been saved in /root/.ssh/id_ed25519" },
      { t: "",      v: "Your public key has been saved in /root/.ssh/id_ed25519.pub" },
      { t: "muted", v: "The key fingerprint is: SHA256:qL3v9d... root@xakker" },
    ],
  },
  {
    test: c => c.startsWith("ssh"),
    run: (c) => [
      { t: "",      v: `The authenticity of host '${c.split(/\s+/)[1] || "target"}' can't be established.` },
      { t: "",      v: "ED25519 key fingerprint is SHA256:6nH2P/oq...9fQ." },
      { t: "muted", v: "Are you sure you want to continue connecting (yes/no/[fingerprint])? yes" },
      { t: "err",   v: "Permission denied (publickey,password)." },
    ],
  },
  {
    test: c => c === "ps" || c.startsWith("ps ") || c.startsWith("ps-"),
    run: () => [
      { t: "",      v: "  PID TTY          TIME CMD" },
      { t: "",      v: "    1 ?        00:00:01 systemd" },
      { t: "",      v: "  482 ?        00:00:00 sshd" },
      { t: "",      v: "  731 ?        00:00:02 apache2" },
      { t: "",      v: " 1042 ?        00:00:00 mysqld" },
      { t: "",      v: " 2210 pts/0    00:00:00 bash" },
      { t: "",      v: " 2288 pts/0    00:00:00 ps" },
    ],
  },
  {
    test: c => c === "top" || c === "htop",
    run: () => [
      { t: "muted", v: "top - " + new Date().toLocaleTimeString() + " up 4 days,  2:17,  1 user,  load average: 0.08, 0.05, 0.01" },
      { t: "",      v: "Tasks:  92 total,   1 running,  91 sleeping,   0 stopped,   0 zombie" },
      { t: "",      v: "%Cpu(s):  1.3 us,  0.7 sy,  0.0 ni, 97.8 id,  0.2 wa" },
      { t: "",      v: "MiB Mem :   3942.1 total,   1822.4 free,    611.0 used,   1508.7 buff/cache" },
      { t: "",      v: "" },
      { t: "",      v: "  PID USER      PR  NI    VIRT    RES  %CPU  %MEM  TIME+  COMMAND" },
      { t: "",      v: "  731 www-data  20   0  212344  18220   0.7   0.5  0:02.14 apache2" },
      { t: "",      v: " 1042 mysql     20   0  1194212 92100  0.3   2.3  0:04.91 mysqld" },
    ],
  },
  {
    test: c => c.startsWith("netstat") || c.startsWith("ss"),
    run: () => [
      { t: "info", v: "Proto Recv-Q Send-Q Local Address           Foreign Address         State" },
      { t: "",     v: "tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN" },
      { t: "",     v: "tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN" },
      { t: "",     v: "tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN" },
      { t: "",     v: "tcp        0      0 10.10.11.42:80          10.10.11.15:51230       ESTABLISHED" },
    ],
  },
  {
    test: c => c.startsWith("john"),
    run: () => [
      { t: "muted",   v: "Using default input encoding: UTF-8" },
      { t: "",        v: "Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])" },
      { t: "",        v: "Cost 1 (iteration count) is 1024 for all loaded hashes" },
      { t: "",        v: "Will run 4 OpenMP threads" },
      { t: "",        v: "Press 'q' or Ctrl-C to abort, almost any other key for status" },
      { t: "success", v: "P@ssw0rd2024    (admin)" },
      { t: "muted",   v: "1g 0:00:00:41 100% 2.415g/s 12345p/s 12345c/s 12345C/s" },
      { t: "success", v: "[ ✓ Cracked hash → admin:P@ssw0rd2024 ]" },
    ],
  },
  {
    test: c => c.startsWith("nikto"),
    run: () => [
      { t: "muted",   v: "- Nikto v2.5.0" },
      { t: "info",    v: "+ Target IP:          10.10.11.42" },
      { t: "info",    v: "+ Target Hostname:    target" },
      { t: "",        v: "+ Server: Apache/2.4.52 (Ubuntu)" },
      { t: "",        v: "+ /admin/: Directory indexing found." },
      { t: "success", v: "+ /backup/db.sql: Database backup file exposed." },
      { t: "muted",   v: "+ 7 host(s) tested" },
    ],
  },
  {
    test: c => c.startsWith("whatweb"),
    run: () => [
      { t: "",      v: "target [200 OK] Apache[2.4.52], Country[RESERVED][ZZ], HTML5," },
      { t: "",      v: "  HTTPServer[Apache/2.4.52 (Ubuntu)], IP[10.10.11.42]," },
      { t: "",      v: "  PHP[8.1.12], X-Powered-By[PHP/8.1.12]" },
    ],
  },
  {
    test: c => c.startsWith("dirb"),
    run: () => [
      { t: "muted",   v: "DIRB v2.22    By The Dark Raver" },
      { t: "",        v: "START_TIME: " + new Date().toLocaleTimeString() },
      { t: "",        v: "---- Scanning URL: http://target/ ----" },
      { t: "",        v: "+ http://target/admin (CODE:301|SIZE:316)" },
      { t: "success", v: "+ http://target/admin/login.php (CODE:200|SIZE:1024)" },
      { t: "",        v: "+ http://target/uploads (CODE:403|SIZE:279)" },
      { t: "muted",   v: "END_TIME: " + new Date().toLocaleTimeString() },
    ],
  },
  {
    test: c => c.startsWith("searchsploit"),
    run: (c) => {
      const term = c.replace("searchsploit", "").trim() || "apache";
      return [
        { t: "muted",   v: "---------------------------------------- ---------------------------------" },
        { t: "info",    v: " Exploit Title                                 |  Path" },
        { t: "muted",   v: "---------------------------------------- ---------------------------------" },
        { t: "success", v: ` ${term} 2.4.52 - Path Traversal / RCE           |  linux/webapps/51447.py` },
        { t: "",        v: ` ${term} mod_cgi - Remote Code Execution        |  linux/remote/50383.py` },
        { t: "muted",   v: "---------------------------------------- ---------------------------------" },
      ];
    },
  },
  {
    test: c => c.startsWith("msfconsole"),
    run: () => [
      { t: "muted", v: "       =[ metasploit v6.4.0-dev                          ]" },
      { t: "muted", v: "+ -- --=[ 2412 exploits - 1249 auxiliary - 424 post       ]" },
      { t: "muted", v: "+ -- --=[ 1470 payloads - 47 encoders - 11 nops           ]" },
      { t: "",      v: "" },
      { t: "info",  v: "msf6 > exit" },
      { t: "muted", v: "(session closed)" },
    ],
  },
];

const COMMAND_NAMES = [
  "ls","cd","pwd","cat","echo","whoami","id","uname","history","mkdir","touch","help","clear",
  "nmap","gobuster","curl","hydra","sqlmap","nc","netcat","find","python3",
  "rm","cp","mv","chmod","chown","grep","head","tail","wc","env","export","which","man",
  "date","uptime","df","du","ifconfig","ip","ping","wget","ssh","ssh-keygen","ps","top","htop",
  "netstat","ss","john","nikto","whatweb","dirb","searchsploit","msfconsole","exit","logout",
];

/* ── Real virtual-filesystem shell, layered on top of the canned CTF-flavor
      command outputs (nmap/gobuster/curl/hydra/sqlmap/nc/find/python3). ── */
function shellExec(raw, ctx) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (lower === "clear") return { clear: true };

  const parts = trimmed.split(/\s+/);
  const cmd0  = parts[0].toLowerCase();
  const args  = parts.slice(1);
  const notFound = () => [
    { t: "err", v: `zsh: command not found: ${parts[0]}` },
    { t: "muted", v: "Type 'help' to see available commands." },
  ];

  switch (cmd0) {
    case "help":
      return { lines: helpLines() };

    case "pwd":
      return { lines: [{ t: "", v: ctx.cwd }] };

    case "cd": {
      const target = args[0] ? resolvePath(ctx.cwd, args[0]) : HOME;
      const node = getNode(ctx.fs, target);
      if (!node) return { lines: [{ t: "err", v: `cd: ${args[0]}: No such file or directory` }] };
      if (node.type !== "dir") return { lines: [{ t: "err", v: `cd: ${args[0]}: Not a directory` }] };
      return { lines: [], cwd: target };
    }

    case "ls": {
      const pathArg = args.find(a => !a.startsWith("-"));
      const target  = pathArg ? resolvePath(ctx.cwd, pathArg) : ctx.cwd;
      const node    = getNode(ctx.fs, target);
      if (!node) return { lines: [{ t: "err", v: `ls: cannot access '${pathArg}': No such file or directory` }] };
      if (node.type === "file") return { lines: [{ t: "", v: pathArg }] };
      const names = Object.keys(node.children).sort();
      if (!names.length) return { lines: [] };
      return { lines: names.map(n => {
        const child = node.children[n];
        return child.type === "dir"
          ? { t: "info", v: `${n}/` }
          : { t: n.includes("passwd") || n.endsWith(".txt") ? "" : "", v: n };
      }) };
    }

    case "cat": {
      if (!args.length) return { lines: [{ t: "err", v: "cat: missing operand" }] };
      const lines = [];
      for (const a of args) {
        const target = resolvePath(ctx.cwd, a);
        const node = getNode(ctx.fs, target);
        if (!node) { lines.push({ t: "err", v: `cat: ${a}: No such file or directory` }); continue; }
        if (node.type === "dir") { lines.push({ t: "err", v: `cat: ${a}: Is a directory` }); continue; }
        node.content.forEach(l => lines.push({ t: l.includes("xkr{") ? "success" : "", v: l }));
      }
      return { lines };
    }

    case "mkdir": {
      if (!args.length) return { lines: [{ t: "err", v: "mkdir: missing operand" }] };
      const target = resolvePath(ctx.cwd, args[0]);
      const parent = getNode(ctx.fs, target.slice(0, target.lastIndexOf("/")) || "/");
      const name = target.split("/").pop();
      if (!parent || parent.type !== "dir") return { lines: [{ t: "err", v: `mkdir: cannot create directory '${args[0]}': No such file or directory` }] };
      if (parent.children[name]) return { lines: [{ t: "err", v: `mkdir: cannot create directory '${args[0]}': File exists` }] };
      parent.children[name] = { type: "dir", children: {} };
      return { lines: [] };
    }

    case "touch": {
      if (!args.length) return { lines: [{ t: "err", v: "touch: missing operand" }] };
      const target = resolvePath(ctx.cwd, args[0]);
      const parent = getNode(ctx.fs, target.slice(0, target.lastIndexOf("/")) || "/");
      const name = target.split("/").pop();
      if (!parent || parent.type !== "dir") return { lines: [{ t: "err", v: `touch: cannot touch '${args[0]}': No such file or directory` }] };
      if (!parent.children[name]) parent.children[name] = { type: "file", content: [] };
      return { lines: [] };
    }

    case "echo":
      return { lines: [{ t: "", v: args.join(" ").replace(/^"(.*)"$/, "$1") }] };

    case "whoami":
      return { lines: [{ t: "success", v: "root" }] };

    case "id":
      return { lines: [{ t: "", v: "uid=0(root) gid=0(root) groups=0(root)" }] };

    case "uname":
      return { lines: [{ t: "", v: args.includes("-a")
        ? "Linux xakker 5.15.0-kali3-amd64 #1 SMP Debian x86_64 GNU/Linux"
        : "Linux" }] };

    case "history":
      return { lines: ctx.history.length
        ? ctx.history.map((h, i) => ({ t: "muted", v: `  ${i + 1}  ${h}` }))
        : [{ t: "muted", v: "" }] };

    case "rm": {
      if (!args.length) return { lines: [{ t: "err", v: "rm: missing operand" }] };
      let lines = [];
      for (const a of args.filter(x => !x.startsWith("-"))) {
        const target = resolvePath(ctx.cwd, a);
        const parent = getNode(ctx.fs, target.slice(0, target.lastIndexOf("/")) || "/");
        const name = target.split("/").pop();
        if (!parent || !parent.children[name]) { lines.push({ t: "err", v: `rm: cannot remove '${a}': No such file or directory` }); continue; }
        delete parent.children[name];
      }
      return { lines };
    }

    case "cp":
      if (args.length < 2) return { lines: [{ t: "err", v: "cp: missing destination file operand" }] };
      return { lines: [] };

    case "mv":
      if (args.length < 2) return { lines: [{ t: "err", v: "mv: missing destination file operand" }] };
      return { lines: [] };

    case "chmod":
      if (args.length < 2) return { lines: [{ t: "err", v: "chmod: missing operand" }] };
      return { lines: [] };

    case "chown":
      if (args.length < 2) return { lines: [{ t: "err", v: "chown: missing operand" }] };
      return { lines: [] };

    case "grep": {
      if (args.length < 2) return { lines: [{ t: "err", v: "Usage: grep [OPTION]... PATTERN [FILE]..." }] };
      const [pattern, ...fileArgs] = args;
      const lines = [];
      for (const a of fileArgs) {
        const target = resolvePath(ctx.cwd, a);
        const node = getNode(ctx.fs, target);
        if (!node) { lines.push({ t: "err", v: `grep: ${a}: No such file or directory` }); continue; }
        if (node.type === "dir") { lines.push({ t: "err", v: `grep: ${a}: Is a directory` }); continue; }
        node.content.filter(l => l.toLowerCase().includes(pattern.toLowerCase()))
          .forEach(l => lines.push({ t: l.includes("xkr{") ? "success" : "", v: l }));
      }
      return { lines };
    }

    case "head":
    case "tail": {
      if (!args.length) return { lines: [{ t: "err", v: `${cmd0}: missing operand` }] };
      const target = resolvePath(ctx.cwd, args[args.length - 1]);
      const node = getNode(ctx.fs, target);
      if (!node) return { lines: [{ t: "err", v: `${cmd0}: cannot open '${args[0]}' for reading: No such file or directory` }] };
      if (node.type === "dir") return { lines: [{ t: "err", v: `${cmd0}: error reading '${args[0]}': Is a directory` }] };
      const content = cmd0 === "head" ? node.content.slice(0, 10) : node.content.slice(-10);
      return { lines: content.map(l => ({ t: l.includes("xkr{") ? "success" : "", v: l })) };
    }

    case "wc": {
      if (!args.length) return { lines: [{ t: "err", v: "wc: missing operand" }] };
      const target = resolvePath(ctx.cwd, args[0]);
      const node = getNode(ctx.fs, target);
      if (!node) return { lines: [{ t: "err", v: `wc: ${args[0]}: No such file or directory` }] };
      if (node.type === "dir") return { lines: [{ t: "err", v: `wc: ${args[0]}: Is a directory` }] };
      const words = node.content.join(" ").split(/\s+/).filter(Boolean).length;
      const bytes = node.content.join("\n").length;
      return { lines: [{ t: "", v: `  ${node.content.length}  ${words}  ${bytes} ${args[0]}` }] };
    }

    case "env":
      return { lines: [
        { t: "", v: "SHELL=/bin/bash" },
        { t: "", v: "USER=root" },
        { t: "", v: "PWD=" + ctx.cwd },
        { t: "", v: "HOME=/root" },
        { t: "", v: "LANG=en_US.UTF-8" },
        { t: "", v: "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin" },
      ] };

    case "export":
      return { lines: [] };

    case "which": {
      if (!args.length) return { lines: [] };
      const known = ["nmap","gobuster","curl","hydra","sqlmap","nc","python3","ssh","john","nikto"];
      return { lines: [{ t: known.includes(args[0]) ? "" : "err",
        v: known.includes(args[0]) ? `/usr/bin/${args[0]}` : `which: no ${args[0]} in ($PATH)` }] };
    }

    case "man": {
      if (!args.length) return { lines: [{ t: "err", v: "What manual page do you want?" }] };
      const descs = {
        nmap: "nmap - Network exploration tool and security / port scanner",
        gobuster: "gobuster - Directory/file, DNS and VHost busting tool",
        curl: "curl - transfer a URL",
        hydra: "hydra - a very fast network logon cracker",
        sqlmap: "sqlmap - automatic SQL injection and database takeover tool",
        ssh: "ssh - OpenSSH remote login client",
        nc: "nc - arbitrary TCP and UDP connections and listens",
      };
      return { lines: [{ t: "info", v: descs[args[0]] || `No manual entry for ${args[0]}` }] };
    }

    case "date":
      return { lines: [{ t: "", v: new Date().toString() }] };

    case "uptime":
      return { lines: [{ t: "", v: ` ${new Date().toLocaleTimeString()} up 4 days,  2:17,  1 user,  load average: 0.08, 0.05, 0.01` }] };

    case "df":
      return { lines: [
        { t: "info", v: "Filesystem     1K-blocks    Used Available Use% Mounted on" },
        { t: "",     v: "/dev/sda1       20511356 6234120  13212840  33% /" },
        { t: "",     v: "tmpfs            1971040       0   1971040   0% /dev/shm" },
      ] };

    case "du":
      return { lines: [
        { t: "", v: "4.0K\t./recon" },
        { t: "", v: "8.0K\t./www" },
        { t: "", v: "16K\t." },
      ] };

    case "exit":
    case "logout":
      return { lines: [{ t: "muted", v: "logout" }, { t: "muted", v: "[ session remains open in this simulated shell ]" }] };

    default: {
      for (const e of SIM) {
        if (e.test(lower)) return { lines: e.run(lower) };
      }
      return { lines: notFound() };
    }
  }
}

/* ── Tab-completion: command names + FS-aware path completion ─────── */
function completeLine(line, ctx) {
  const parts = line.split(" ");
  const last  = parts[parts.length - 1];
  if (!last) return line;

  if (parts.length === 1) {
    const match = COMMAND_NAMES.find(w => w.startsWith(last) && w !== last);
    if (match) parts[0] = match;
    return parts.join(" ");
  }

  const cmd0 = parts[0].toLowerCase();
  if (["cd", "ls", "cat", "touch", "mkdir"].includes(cmd0)) {
    const slashIdx = last.lastIndexOf("/");
    const dirPart  = slashIdx >= 0 ? last.slice(0, slashIdx + 1) : "";
    const prefix   = slashIdx >= 0 ? last.slice(slashIdx + 1) : last;
    const baseAbs  = dirPart ? resolvePath(ctx.cwd, dirPart) : ctx.cwd;
    const node     = getNode(ctx.fs, baseAbs);
    if (node && node.type === "dir") {
      const names = Object.keys(node.children).filter(n => n.startsWith(prefix));
      if (names.length === 1) {
        const child  = node.children[names[0]];
        const suffix = child.type === "dir" ? "/" : "";
        parts[parts.length - 1] = dirPart + names[0] + suffix;
      }
    }
  }
  return parts.join(" ");
}

/* ── Difficulty badge ──────────────────────────────────────────── */
const DIFF_META = {
  beginner:     { color: "#6effd6", n: 1 },
  easy:         { color: "#6effd6", n: 1 },
  intermediate: { color: "#ffb86b", n: 2 },
  medium:       { color: "#ffb86b", n: 2 },
  advanced:     { color: "#ff7a8a", n: 3 },
  hard:         { color: "#ff7a8a", n: 3 },
  expert:       { color: "#c084fc", n: 4 },
};
const DIFF_LABEL = {
  az: { beginner: "Asan", easy: "Asan", intermediate: "Orta", medium: "Orta", advanced: "Çətin", hard: "Çətin", expert: "Ekspert" },
  en: { beginner: "Easy", easy: "Easy", intermediate: "Medium", medium: "Medium", advanced: "Hard", hard: "Hard", expert: "Expert" },
};
function diffMeta(level, lang) {
  const key = (level || "beginner").toLowerCase();
  const meta = DIFF_META[key] || DIFF_META.beginner;
  const label = (DIFF_LABEL[lang] || DIFF_LABEL.az)[key] || (DIFF_LABEL[lang] || DIFF_LABEL.az).beginner;
  return { ...meta, label };
}
function DiffBadge({ level, lang }) {
  const d = diffMeta(level, lang);
  return (
    <span className="fi-badge" style={{
      color: d.color, background: `${d.color}14`, border: `1px solid ${d.color}35`,
      display: "inline-flex", alignItems: "center", gap: 5,
    }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <svg key={i} width={10} height={10} viewBox="0 0 24 24"
          fill={i < d.n ? d.color : "none"} stroke={i < d.n ? d.color : "rgba(255,255,255,0.18)"} strokeWidth={1.5}>
          <path d="M12 3l2.6 5.6 6.1.8-4.5 4.2 1.2 6L12 17l-5.4 2.6 1.2-6L3.3 9.4l6.1-.8z" />
        </svg>
      ))}
      {d.label}
    </span>
  );
}

/* ── Kali-style PS1 prompt renderer ───────────────────────────── */
function KaliPS1({ cmd, path = "~/lab", isInput = false }) {
  return (
    <div className="lab-cmd-block">
      <div className="lab-ps1-line-1">
        <span className="kali-bracket">┌──(</span>
        <span className="kali-user">kali</span>
        <span className="kali-at">㉿</span>
        <span className="kali-host">xakker</span>
        <span className="kali-bracket">)-[</span>
        <span className="kali-path">{path}</span>
        <span className="kali-bracket">]</span>
      </div>
      <div className="lab-ps1-line-2">
        <span className="kali-bracket">└─</span>
        <span className="kali-dollar">$ </span>
        {isInput ? null : <span className="kali-cmd">{cmd}</span>}
      </div>
    </div>
  );
}

/* ── Single task row + answer submission ─────────────────────── */
function TaskRow({ task, roomSlug, onDone, lang }) {
  const isDone = task.completed || task._localDone;
  const [open,    setOpen]    = useState(false);
  const [answers, setAnswers] = useState({}); // questionId → value
  const [states,  setStates]  = useState({}); // questionId → idle|checking|ok|wrong
  const [msgs,    setMsgs]    = useState({}); // questionId → message
  const [hints,   setHints]   = useState({}); // questionId → text|null

  const submit = async (q) => {
    const val = (answers[q.id] || "").trim();
    if (!val || states[q.id] === "checking" || states[q.id] === "ok") return;
    setStates(s => ({ ...s, [q.id]: "checking" }));
    try {
      const res = await endpoints.submitAnswer(roomSlug, task.slug, {
        question_id: q.id,
        answer: val,
      });
      const d = res.data;
      if (d.is_correct) {
        setStates(s => ({ ...s, [q.id]: "ok" }));
        setMsgs(m => ({ ...m, [q.id]: d.explanation || (lang === "az" ? "✓ Düzgün cavab! " : "✓ Correct! ") + (d.xp_delta ? `+${d.xp_delta} XP` : "") }));
        onDone(task.id);
      } else {
        setStates(s => ({ ...s, [q.id]: "wrong" }));
        setMsgs(m => ({ ...m, [q.id]: d.explanation || (lang === "az" ? "✗ Yanlış cavab. Yenidən cəhd et." : "✗ Wrong answer. Try again.") }));
        setTimeout(() => setStates(s => ({ ...s, [q.id]: "idle" })), 2200);
      }
    } catch {
      setStates(s => ({ ...s, [q.id]: "wrong" }));
      setMsgs(m => ({ ...m, [q.id]: lang === "az" ? "Xəta baş verdi." : "Something went wrong." }));
      setTimeout(() => setStates(s => ({ ...s, [q.id]: "idle" })), 2200);
    }
  };

  const revealHint = async (q) => {
    if (hints[q.id] !== undefined) return;
    try {
      const res = await endpoints.revealHint(roomSlug, task.slug, q.id);
      setHints(h => ({ ...h, [q.id]: res.data?.hint || "" }));
    } catch {
      setHints(h => ({ ...h, [q.id]: "" }));
    }
  };

  const itemClass = isDone ? "done" : open ? "active" : "";

  return (
    <div className={`lab-task-item ${itemClass}`}>
      <button className="lab-task-header" onClick={() => !isDone && setOpen(v => !v)}>
        <div className="lab-task-num">
          {isDone
            ? <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12l4 4 10-10" /></svg>
            : task.order}
        </div>
        <span className="lab-task-title">{task.title}</span>
        <span className="lab-task-xp">+{task.points}</span>
        {!isDone && (
          <svg className={`lab-task-chevron${open ? " open" : ""}`}
            width={13} height={13} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>

      {open && !isDone && (
        <div className="lab-task-body">
          {task.questions?.map(q => (
            <div key={q.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div className="lab-task-prompt">{q.prompt}</div>

              <div className="lab-answer-row">
                <input
                  className={`lab-answer-input${states[q.id] === "ok" ? " ok" : states[q.id] === "wrong" ? " wrong" : ""}`}
                  placeholder={q.kind === "flag" ? "xkr{...}" : (lang === "az" ? "Cavabı daxil et..." : "Enter your answer...")}
                  value={answers[q.id] || ""}
                  onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && submit(q)}
                  disabled={states[q.id] === "ok"}
                />
                <button
                  className="lab-answer-btn"
                  onClick={() => submit(q)}
                  disabled={!answers[q.id]?.trim() || states[q.id] === "ok" || states[q.id] === "checking"}
                >
                  {states[q.id] === "checking" ? "…" : "→"}
                </button>
              </div>

              {msgs[q.id] && (
                <div className={`lab-answer-fb ${states[q.id] === "ok" ? "ok" : "wrong"}`}>
                  {msgs[q.id]}
                </div>
              )}

              {q.has_hint && hints[q.id] === undefined && (
                <button className="lab-hint-btn" onClick={() => revealHint(q)}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                    <rect x={3} y={11} width={18} height={11} rx={2} />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  {lang === "az" ? "İpucunu göstər" : "Show hint"}
                  {q.hint_cost > 0 && <span className="lab-hint-cost">-{q.hint_cost} XP</span>}
                </button>
              )}

              {hints[q.id] && (
                <div className="lab-hint-text">
                  <div className="lab-hint-label">💡 {lang === "az" ? "İpucu" : "Hint"}</div>
                  {hints[q.id]}
                </div>
              )}
            </div>
          ))}

          {(!task.questions || task.questions.length === 0) && (
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", margin: 0 }}>
              {lang === "az" ? "Bu tapşırıq üçün cavab forması yoxdur." : "This task has no answer form."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ── About tab content ─────────────────────────────────────────── */
const ENV_INFO = {
  az: {
    docker:  { label: "Docker Container", desc: "Yüngülçəkili, sürətli başlayan mühit." },
    vm:      { label: "Virtual Machine",  desc: "Tam izolə edilmiş VM, real OS." },
    linux:   { label: "Linux Server",     desc: "Linux əsaslı hədəf sistem." },
    windows: { label: "Windows Server",   desc: "Windows əsaslı hədəf sistem." },
    web:     { label: "Web App",          desc: "Bulud əsaslı veb tətbiq hədəfi." },
    cloud:   { label: "Cloud Instance",   desc: "Bulud əsaslı infrastruktur hədəfi." },
  },
  en: {
    docker:  { label: "Docker Container", desc: "Lightweight, fast-starting environment." },
    vm:      { label: "Virtual Machine",  desc: "Fully isolated VM, real OS." },
    linux:   { label: "Linux Server",     desc: "Linux-based target system." },
    windows: { label: "Windows Server",   desc: "Windows-based target system." },
    web:     { label: "Web App",          desc: "Cloud-hosted web app target." },
    cloud:   { label: "Cloud Instance",   desc: "Cloud-hosted infrastructure target." },
  },
};

function AboutTab({ room, targetIp, lang }) {
  const level = (room.level || "beginner").toLowerCase();
  const diff = diffMeta(level, lang);

  const envInfo = (ENV_INFO[lang] || ENV_INFO.az)[(room.env || "docker").toLowerCase()]
    || { label: room.env || "Docker", desc: "" };

  return (
    <div className="lab-about">
      <h2>{room.title}</h2>
      <p>{room.description || room.summary || (lang === "az" ? "İzolyasiya olunmuş mühitdə praktik pentest məşqi." : "Hands-on pentest exercise in an isolated environment.")}</p>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10, margin: "18px 0",
      }}>
        {[
          { label: lang === "az" ? "Hədəf IP" : "Target IP",  value: targetIp, mono: true,  color: "var(--accent)" },
          { label: lang === "az" ? "Mühit"    : "Environment", value: envInfo.label                                  },
          { label: lang === "az" ? "Çətinlik" : "Difficulty",  value: diff.label, color: diff.color                  },
          { label: lang === "az" ? "Müddət"   : "Duration",    value: lang === "az" ? `~${room.estimated_minutes || 60} dəq` : `~${room.estimated_minutes || 60} min` },
        ].map(s => (
          <div key={s.label} style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid var(--line)",
            borderRadius: 8, padding: "10px 12px",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--ink-4)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>
              {s.label}
            </div>
            <div style={{
              fontFamily: s.mono ? "var(--font-mono)" : "var(--font-display)",
              fontWeight: 700, fontSize: 13,
              color: s.color || "var(--ink-1)",
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 18 }}>{lang === "az" ? "Başlamaq üçün" : "Getting started"}</h2>
      <p>{lang === "az" ? "Aşağıdakı addımları izlə:" : "Follow these steps:"}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {[
          { n: "1", text: lang === "az" ? `nmap -sV ${targetIp} — Açıq portları tap` : `nmap -sV ${targetIp} — Find open ports` },
          { n: "2", text: lang === "az" ? `gobuster dir -u http://${targetIp} — Gizli URL-ləri axtar` : `gobuster dir -u http://${targetIp} — Discover hidden URLs` },
          { n: "3", text: lang === "az" ? "Tapılan giriş nöqtəsini araşdır" : "Investigate the entry point you find" },
          { n: "4", text: lang === "az" ? "Flag-ı tap və tapşırıq formasına daxil et" : "Find the flag and submit it in the task form" },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
              background: "var(--accent)", color: "#fff",
              width: 18, height: 18, borderRadius: "50%",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1,
            }}>{s.n}</span>
            <code style={{ fontSize: 12.5, color: "var(--ink-2)", fontFamily: "var(--font-mono)", background: "none", padding: 0 }}>{s.text}</code>
          </div>
        ))}
      </div>

      <h2>{lang === "az" ? "Terminal haqqında" : "About the terminal"}</h2>
      {lang === "az" ? (
        <p>
          Sağdakı terminal simulyasiya edilmiş bir Kali Linux mühitidir.
          Real alət çıxışlarına bənzər cavablar verir.
          <code>help</code> yazaraq əmrlərin siyahısını gör.
          ↑/↓ düymələri ilə əmr tarixçəsinə dön, <code>Tab</code> ilə tamamla.
        </p>
      ) : (
        <p>
          The terminal on the right is a simulated Kali Linux environment.
          It returns responses that mimic real tool output.
          Type <code>help</code> to see the list of commands.
          Use ↑/↓ to navigate command history, <code>Tab</code> to autocomplete.
        </p>
      )}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */
export default function RoomDetailPage() {
  const { slug } = useParams();
  const { lang } = useLang();

  const [room,     setRoom]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [doneTasks, setDoneTasks] = useState(new Set());
  const [tab,      setTab]      = useState("terminal"); // terminal | about | writeup

  /* Terminal state */
  const makeWelcome = (ip) => [
    {
      type: "banner",
      lines: [
        { t: "banner", v: "  ██╗  ██╗ █████╗ ██╗  ██╗██╗  ██╗███████╗██████╗ " },
        { t: "banner", v: "  ╚██╗██╔╝██╔══██╗██║ ██╔╝██║ ██╔╝██╔════╝██╔══██╗" },
        { t: "banner", v: "   ╚███╔╝ ███████║█████╔╝ █████╔╝ █████╗  ██████╔╝" },
        { t: "banner", v: "   ██╔██╗ ██╔══██║██╔═██╗ ██╔═██╗ ██╔══╝  ██╔══██╗" },
        { t: "banner", v: "  ██╔╝ ██╗██║  ██║██║  ██╗██║  ██╗███████╗██║  ██║" },
        { t: "banner", v: "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝" },
        { t: "muted",  v: "" },
        { t: "info",   v: `  Pentest Lab v2.1  |  Target: ${ip || "10.10.11.1"}` },
        { t: "muted",  v: "  ─────────────────────────────────────────────────" },
        { t: "",       v: "  Type 'help' to see available commands." },
        { t: "muted",  v: "" },
      ],
    },
  ];

  const [blocks,   setBlocks]   = useState(() => makeWelcome("10.10.11.1"));
  const [cmd,      setCmd]      = useState("");
  const [history,  setHistory]  = useState([]);
  const [histIdx,  setHistIdx]  = useState(-1);
  const [savedCmd, setSavedCmd] = useState("");
  const [cwd,      setCwd]      = useState(HOME);

  const fsRef     = useRef(buildFs());
  const outputRef = useRef(null);
  const inputRef  = useRef(null);
  const [termFocused, setTermFocused] = useState(true);

  useEffect(() => {
    let ok = true;
    endpoints.room(slug)
      .then(({ data }) => {
        if (!ok) return;
        setRoom(data);
        // Reset welcome banner with real IP
        setBlocks(makeWelcome(data.target_ip || "10.10.11.1"));
        // Pre-mark completed tasks
        if (data.tasks) {
          const done = new Set(data.tasks.filter(t => t.completed).map(t => t.id));
          setDoneTasks(done);
        }
      })
      .catch(() => {})
      .finally(() => { if (ok) setLoading(false); });
    return () => { ok = false; };
  }, [slug]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [blocks]);

  const markDone = useCallback((taskId) => {
    setDoneTasks(prev => new Set(prev).add(taskId));
  }, []);

  const handleRun = useCallback(() => {
    const c = cmd.trim();
    if (!c) return;

    const runCwd  = cwd;
    const result  = shellExec(c, { cwd, fs: fsRef.current, history });

    setHistory(prev => {
      const next = [...prev.filter(x => x !== c), c];
      return next.slice(-100);
    });
    setHistIdx(-1);
    setSavedCmd("");
    setCmd("");

    if (!result) return;

    if (result.clear) {
      setBlocks(makeWelcome(room?.target_ip || "10.10.11.1"));
      return;
    }

    if (result.cwd) setCwd(result.cwd);

    setBlocks(prev => [
      ...prev,
      { type: "cmd", cmd: c, cwdAtRun: runCwd, lines: result.lines || [] },
    ]);
  }, [cmd, cwd, room, lang, history]);

  const handleKeyDown = useCallback(e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setBlocks(makeWelcome(room?.target_ip || "10.10.11.1"));
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      if (cmd.trim()) {
        setBlocks(prev => [...prev, { type: "cmd", cmd, cwdAtRun: cwd, lines: [{ t: "muted", v: "^C" }] }]);
      }
      setCmd("");
      setHistIdx(-1);
      setSavedCmd("");
      return;
    }
    if (e.key === "Enter") { handleRun(); return; }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      if (histIdx < 0) setSavedCmd(cmd);
      setHistIdx(idx);
      setCmd(history[idx]);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= history.length) { setHistIdx(-1); setCmd(savedCmd); }
      else { setHistIdx(idx); setCmd(history[idx]); }
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      setCmd(prev => completeLine(prev, { cwd, fs: fsRef.current }));
    }
  }, [cmd, cwd, history, histIdx, savedCmd, handleRun, room]);

  /* ── Loading ── */
  if (loading) {
    return (
      <>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <TileSkeleton height={52} />
          <TileSkeleton height={540} />
        </div>
      </>
    );
  }

  if (!room) {
    return (
      <>
        <Link to="/rooms" className="fi-back">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          {lang === "az" ? "Laboratoriyalara qayıt" : "Back to labs"}
        </Link>
        <div className="xk-empty-screen">
          <div className="xk-empty-ico">🧪</div>
          <h3>{lang === "az" ? "Lab tapılmadı" : "Lab not found"}</h3>
        </div>
      </>
    );
  }

  const tasks     = room.tasks || [];
  const totalXp   = room.total_points || tasks.reduce((s, t) => s + (t.points || 0), 0) || 150;
  const doneCount = doneTasks.size;
  const allDone   = tasks.length > 0 && doneCount >= tasks.length;
  const pct       = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : (room.progress_percent || 0);
  const targetIp  = room.target_ip || "10.10.11.1";

  const envIcon = { docker:"🐳", vm:"💻", linux:"🐧", windows:"🪟", web:"🌐", cloud:"☁️" }[
    (room.env || "").toLowerCase()
  ] || "🧪";

  return (
    <>
      <div className="xk-screen" style={{ paddingBottom: 0 }}>

        {/* Back */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Link to="/rooms" className="fi-back" style={{ marginBottom: 0 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            {lang === "az" ? "Geri" : "Back"}
          </Link>
          <span style={{ color: "var(--line-3)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-4)" }}>
            {lang === "az" ? "Laboratoriyalar" : "Labs"}
          </span>
          <span style={{ color: "var(--line-3)" }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-2)" }}>
            {room.title}
          </span>
        </div>

        {/* Header bar */}
        <div className="lab-header">
          <span style={{ fontSize: 22, flexShrink: 0 }}>{envIcon}</span>
          <span className="lab-header-title">{room.title}</span>
          <div className="lab-header-badges">
            <DiffBadge level={room.level} lang={lang} />
            <span className="fi-badge fi-badge-muted" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
              {(room.env || "Docker").toUpperCase()}
            </span>
            <span className="fi-badge fi-badge-muted" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
              {targetIp}
            </span>
            <span className="fi-badge fi-badge-muted" style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
              {totalXp} XP
            </span>
            {allDone
              ? <span className="lab-status-dot done">✓ {lang === "az" ? "Tamamlandı" : "Completed"}</span>
              : <span className="lab-status-dot active">{lang === "az" ? "Aktiv" : "Active"}</span>
            }
          </div>
        </div>

        {/* Split workspace */}
        <div className="lab-workspace">

          {/* ── LEFT PANEL ── */}
          <div className="lab-left">
            <div className="lab-left-scroll">

              {/* Tasks */}
              <div className="lab-panel-sect">
                <div className="lab-panel-head">
                  {lang === "az" ? "Tapşırıqlar" : "Tasks"}
                  <span className="lab-panel-head-count">{doneCount}/{tasks.length}</span>
                </div>

                {pct > 0 && (
                  <div className="lab-progress-wrap" style={{ marginBottom: 10 }}>
                    <div className="lab-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                )}

                {tasks.length === 0 ? (
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)", margin: 0 }}>
                    {lang === "az" ? "Tapşırıq yoxdur." : "No tasks."}
                  </p>
                ) : (
                  <div className="lab-task-list">
                    {tasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={{ ...task, _localDone: doneTasks.has(task.id) }}
                        roomSlug={slug}
                        onDone={markDone}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}

                {allDone && (
                  <div className="lab-done-banner" style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 18 }}>🎉</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13, color: "var(--ok)" }}>
                        {lang === "az" ? "Lab tamamlandı!" : "Lab completed!"}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--ok)", opacity: 0.7 }}>
                        {lang === "az" ? `+${totalXp} XP qazandın` : `+${totalXp} XP earned`}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ── RIGHT PANEL: TERMINAL ── */}
          <div className="lab-right">

            {/* Tab bar */}
            <div className="lab-tabs">
              <div className="lab-tab-traffic">
                <span className="lab-tab-dot r" />
                <span className="lab-tab-dot y" />
                <span className="lab-tab-dot g" />
              </div>
              {[
                { id: "terminal", label: "Terminal", icon: ">_" },
                { id: "about",    label: lang === "az" ? "Haqqında" : "About", icon: "ℹ" },
                { id: "writeup",  label: allDone ? "Write-up" : "Write-up 🔒", icon: "📄", locked: !allDone },
              ].map(t => (
                <button
                  key={t.id}
                  className={`lab-tab${tab === t.id ? " active" : ""}${t.locked ? " locked" : ""}`}
                  onClick={() => !t.locked && setTab(t.id)}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, opacity: 0.6 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}

              {/* Reset */}
              <button
                style={{
                  marginLeft: "auto", marginRight: 8,
                  background: "none", border: "1px solid var(--line-2)", borderRadius: 6,
                  padding: "3px 10px", fontFamily: "var(--font-mono)", fontSize: 10.5,
                  color: "var(--ink-4)", cursor: "pointer", transition: "color 150ms, border-color 150ms",
                }}
                onMouseOver={e => { e.currentTarget.style.color = "var(--ink-1)"; e.currentTarget.style.borderColor = "var(--line-3)"; }}
                onMouseOut={e => { e.currentTarget.style.color = "var(--ink-4)"; e.currentTarget.style.borderColor = "var(--line-2)"; }}
                onClick={() => {
                  setBlocks(makeWelcome(targetIp));
                  setHistory([]);
                  setHistIdx(-1);
                  setSavedCmd("");
                  setCmd("");
                  setCwd(HOME);
                  fsRef.current = buildFs();
                }}
              >
                ↺ {lang === "az" ? "Sıfırla" : "Reset"}
              </button>
            </div>

            {/* Terminal tab */}
            {tab === "terminal" && (
              <>
                <div ref={outputRef} className="lab-term-output" onClick={() => inputRef.current?.focus()}>
                  {blocks.map((block, bi) => {
                    if (block.type === "banner") {
                      return (
                        <div key={bi} className="lab-welcome">
                          {block.lines.map((l, li) => (
                            <div key={li} className={`lab-out-line${l.t ? ` ${l.t}` : ""}`}>{l.v}</div>
                          ))}
                        </div>
                      );
                    }
                    if (block.type === "cmd") {
                      return (
                        <div key={bi} style={{ marginBottom: 14 }}>
                          <KaliPS1 cmd={block.cmd} path={displayPath(block.cwdAtRun || HOME)} />
                          {block.lines.map((l, li) => (
                            <div key={li} className={`lab-out-line${l.t ? ` ${l.t}` : ""}`}>{l.v}</div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  })}

                  {/* Live input prompt */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="lab-ps1-line-1">
                      <span className="kali-bracket">┌──(</span>
                      <span className="kali-user">kali</span>
                      <span className="kali-at">㉿</span>
                      <span className="kali-host">xakker</span>
                      <span className="kali-bracket">)-[</span>
                      <span className="kali-path">{displayPath(cwd)}</span>
                      <span className="kali-bracket">]</span>
                    </div>
                    <div className="lab-ps1-line-2">
                      <span className="kali-bracket">└─</span>
                      <span className="kali-dollar">$ </span>
                      <span className="kali-cmd">{cmd}</span>
                      <span className={`kali-cursor${termFocused ? " is-focused" : " is-blurred"}`} />
                      <input
                        ref={inputRef}
                        className="lab-term-inp-inline"
                        value={cmd}
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck={false}
                        aria-label="Terminal command line"
                        onChange={e => setCmd(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setTermFocused(true)}
                        onBlur={() => setTermFocused(false)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* About tab */}
            {tab === "about" && (
              <AboutTab room={room} targetIp={targetIp} lang={lang} />
            )}

            {/* Write-up (locked) */}
            {tab === "writeup" && allDone && (
              <div className="lab-about">
                <h2>Write-up</h2>
                <p>
                  {lang === "az"
                    ? "Təbriklər! Bu lab üçün yazılmış addım-addım write-up aşağıdadır."
                    : "Congratulations! The step-by-step write-up for this lab is below."}
                </p>
                <pre>{`# ${room.title} — Write-up

## 1. Reconnaissance
$ nmap -sV ${targetIp}
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1
80/tcp   open  http    Apache 2.4.52
3306/tcp open  mysql   MySQL 8.0

## 2. Web Enumeration
$ gobuster dir -u http://${targetIp}
/admin/login.php  (Status: 200)
/backup/db.sql    (Status: 200)

## 3. SQL Injection
$ sqlmap -u 'http://${targetIp}/?id=1' --dbs --dump
Flag: xkr{SQL_1nj3ct10n_m4st3r}
`}
                </pre>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

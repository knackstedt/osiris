module.exports = [{
    script: 'dist/server/main.js',
    name: 'osiris',
    exec_mode: 'cluster',
    instances: '1',
    port: 3000
}]

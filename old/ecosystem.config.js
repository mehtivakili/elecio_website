module.exports = {
    apps: [{
        name: 'elecio_ir2',
        script: 'node_modules/next/dist/bin/next',
        args:"start -p 8566",
        exec_mode : "fork",
        watch: false,
        output: './logs/out.log',
        error: './logs/error.log',
    }]
};

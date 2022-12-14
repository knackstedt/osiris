

import * as cp from "child_process";

interface VSCodeInput {
    process?: string;
    args?: string[];
    location?: string;
}

interface VSCodeState {
    port?: number;
    isLoaded: boolean;
    id?: string;
}

class VSCode extends AppBase<VSCodeInput, VSCodeState> {
    name = "vscode";
    state: AppBase<VSCodeInput, VSCodeState>["state"] = {
        isLoaded: false,
        useDefaultWindow: true,
        defaultWindowTitle: "vs-code",
    };

    vscode: cp.ChildProcessWithoutNullStreams;

    willUnmount = false;

    runVsCodeCli = (port: number, domain: string): void => {
        this.vscode = cp.spawn(
            process.execPath,
            [
                require.resolve("code-server/out/node/entry.js"),
                `--port=${port}`,
                "--auth=none",
                "--host=0.0.0.0",
                process.cwd() + "/",
            ],
            {
                stdio: ["ipc"],
                env: {
                    PUBLIC_URL: `/${domain}/*/`,
                },
            }
        );
        APIClient.addChildProcess(this.vscode);
        const waitForVscodeToLoad = () => {
            if (!this.willUnmount) {
                axios
                    .request({
                        method: "GET",
                        url: `http://localhost:${port}/`,
                        timeout: 600,
                    })
                    .then(() => {
                        this.setState({ isLoaded: true });
                    })
                    .catch(() => {
                        setTimeout(waitForVscodeToLoad, 500);
                    });
            }
        };
        waitForVscodeToLoad();
    };

    componentWillUnmount = () => {
        this.willUnmount = true;
        this.vscode.kill();
    };

    componentDidMount = () => {
        this.api.portManager.withDomain().then(({ port, domain }) => {
            this.runVsCodeCli(port, domain);
            this.setState({ port, id: domain });
        });
    };

    renderApp: AppBase<VSCodeInput, VSCodeState>["renderApp"] = ({
        Iframe,
        LoadingScreen,
    }) => {
        const { id, isLoaded } = this.state;

        return id && isLoaded ? (
            <Iframe id= { id } type = "internal" />
		) : (
            <LoadingScreen message= { "loading vs-code"} variant = "jumpCube" />
		);
    };
}
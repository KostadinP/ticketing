import 'bootstrap/dist/css/bootstrap.css';
import buildClient from "../api/build-client";
import Header from "../components/header";

function AppComponent({Component, pageProps, currentUser}) {
    return (
        <div>
            <Header currentUser={currentUser}/>
            <div className="container">
                <Component {...pageProps} />
            </div>
        </div>
    )
}

AppComponent.getInitialProps = async function (appContext) {
    const client = buildClient(appContext.ctx);
    const {data} = await client.get('/api/users/currentUser');

    let pageProps = {};
    if (!!appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
        console.log(pageProps);
    }
    Object.assign(pageProps, data)
    return {
        pageProps,
        ...data
    };
}

export default AppComponent;
import {useState} from 'react';
import useRequest from '../../hooks/use-request'
import Router from "next/router";

const NewTicket = () => {

    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const {doRequest, errors} = useRequest({
        url: '/api/tickets',
        method: 'post',
        body: {
            title, price
        },
        onSuccess: () => {
            Router.push('/');
        }
    });

    function onBlur() {
        const value = parseFloat(price);

        if (isNaN(value)) {
            return;
        }

        setPrice(value.toFixed(2));
    }

    function onSubmit(event) {
        event.preventDefault();

        doRequest();
    }

    return (
        <div>
            <h1>Create a ticket</h1>
            <form onSubmit={onSubmit}>
                <div className="form-group">
                    <label>Title</label>
                    <input value={title} onChange={event => setTitle(event.target.value)} className="form-control"/>
                </div>
                <div className="form-group">
                    <label>Price</label>
                    <input value={price} onChange={event => setPrice(event.target.value)} className="form-control"
                           onBlur={onBlur}/>
                </div>
                {errors}
                <button className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}

NewTicket.getInitialProps = async (context, client, currentUser) => {
    return {};
}
export default NewTicket;
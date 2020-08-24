import {useEffect, useState} from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from "next/router";

const OrderDetails = ({order, currentUser}) => {
    const [timeLeft, setTimeLeft] = useState(0);
    const {doRequest, errors} = useRequest({
        url: '/api/payments',
        method: 'post',
        body: {
            orderId: order.id
        },
        onSuccess: function () {
            Router.push('/orders');
        }
    });

    useEffect(() => {
        const findTimeLeft = () => {
            const msLeft = Date.parse(order.expiresAt) - Date.now();
            setTimeLeft(Math.round(msLeft / 1000));
        };

        findTimeLeft();
        const interval = setInterval(findTimeLeft, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    if (timeLeft < 0) {
        return <div>Order Expired</div>;
    }
    return <div>
        Time left to pay: {timeLeft} seconds
        <StripeCheckout
            token={({id}) => {
                console.log(id);
                doRequest({token: id});
            }}
            stripeKey="pk_test_51GyuplHyWrczaBJXY8cgWmKRslAlylEMCyNMjvHnFeLTcI9Np8VxBGj8DGqbncjZE7KAPR8h06PtKIg68CLAoB8t009hry4BlO"
            amount={order.ticket.price * 100}
            email={currentUser.email}
        />
        {errors}
    </div>
};

OrderDetails.getInitialProps = async function (context, client) {
    const {orderId} = context.query;
    const {data} = await client.get(`/api/orders/${orderId}`);
    return {order: data};
}
export default OrderDetails;
import {Ticket} from "../ticket";

it('should implement optimistic concurrency control', async function (done) {
    // Create an instance of the ticket
    const ticket = Ticket.build({
        price: 5,
        title: 'test',
        userId: '123'
    });

    // Save the ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const first = await Ticket.findById(ticket.id);
    const second = await Ticket.findById(ticket.id);

    // Make to separate changes to the tickets we fetched
    first!.set({price: 10});
    second!.set({price: 15});

    // Save the first fetched ticket
    await first!.save();

    // Save the second fetched ticket and expect an error
    try {
        await second!.save();
    } catch (e) {
        console.log(e);
        return done();
    }
    throw new Error('Should not reach this point');
});

it('should increment the version number on multiple saves', async function () {
    const ticket = Ticket.build({
        price: 5,
        title: 'test',
        userId: '123'
    });

    await ticket.save();
    expect(ticket.version).toEqual(0);

    await ticket.save();
    expect(ticket.version).toEqual(1);

    await ticket.save();
    expect(ticket.version).toEqual(2);
});
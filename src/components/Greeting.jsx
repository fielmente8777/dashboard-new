
const Greeting = ({ name }) => {
    const getGreet = () => {
        const hour = new Date().getHours();

        let greeting = 'Hello';
        if (hour >= 5 && hour < 12) {
            greeting = 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good afternoon';
        } else {
            greeting = 'Good evening';
        }

        return greeting;
    }
    return (
        <div>
            <h1 className='text-xl font-bold text-primary/90 '>
                {getGreet()}, {name && <span className="text-orange-700 capitalize">{name}</span>}
            </h1>
            <p className='font-medium text-primary/80 mt-1'>Here’s an update on what’s happening with your property!</p>

        </div>
    )
}

export default Greeting
import React from 'react'
import { MdClose } from 'react-icons/md'
const BookingDetailsPopup = (props) => {
    const { infoData, openInfoPopUpIII, setopenInfoPopUpIII } = props
    const handleClosePopup = () => {
        setopenInfoPopUpIII(!openInfoPopUpIII)
    }
    return (

        <div className='overlayStyle'>

            <div className='w-100 h-100' >
                <div style={{ position: "fixed", top: "15%", left: "25%", zIndex: 1, width: "1050px", }}>
                    <div className='h-100 shadow mb-1 bg-body rounded popUpBG'>
                        <div style={{ display: "flex", position: 'relative', justifyContent: "end", }}>
                            <MdClose className='closeIcon' onClick={handleClosePopup} />
                        </div>

                        <div className="row rounded text-white" style={{ marginTop: '-1.8rem', backgroundColor: '#0A3A75' }} >
                            <div className="col py-2 text-center">
                                Booking ID :{infoData?.bookingId}
                            </div>
                        </div>
                        {!infoData.digitalCheckin ?
                            <div className="row mt-1">
                                <div className="col p-1">
                                    <h5 style={{ textAlign: "center" }}>Digital Checkin</h5>
                                    <table className="table">
                                        <tbody>

                                            <tr>
                                                <th>Guest Name:</th>
                                                <td>{infoData.digitalCheckin?.Name}</td>
                                            </tr>
                                            <tr>
                                                <th>Phone:</th>
                                                <td>{infoData.digitalCheckin?.Phone}</td>
                                            </tr>
                                            <tr>
                                                <th>Email:</th>
                                                <td>{infoData.digitalCheckin?.Email}</td>
                                            </tr>
                                            <tr>
                                                <th>Gender</th>
                                                <td>{infoData.digitalCheckin?.Gender}</td>
                                            </tr>
                                            <tr>
                                                <th>Address</th>
                                                <td>{infoData.digitalCheckin?.Address}, {infoData?.digitalCheckin?.State}, {infoData.digitalCheckin?.City}</td>
                                            </tr>
                                            <tr>
                                                <img style={{ width: "200px", height: "300px" }} src={infoData.digitalCheckin?.GovtId} alt='No GovtId' />
                                                <img style={{ width: "200px", height: "300px" }} src={infoData.digitalCheckin?.Passport} alt='No Passport' />
                                                <img style={{ width: "200px", height: "300px" }} src={infoData.digitalCheckin?.Visa} alt='No Visa' />
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                            </div> : <p style={{ textAlign: "center" }}>No Data, Ask user to fill form</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BookingDetailsPopup
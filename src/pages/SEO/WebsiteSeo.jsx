import React from 'react'
import WebsiteSeoDashboard from '../../components/WebsiteDashboard'
import SeoTokenBalanceCard from '../../components/SeoToken/SeoTokenBalanceCard'

const WebsiteSeo = () => {
    return (
        <div>
            <SeoTokenBalanceCard />
            <WebsiteSeoDashboard/>
        </div>
    )
}

export default WebsiteSeo
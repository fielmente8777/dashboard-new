import axios from "axios";
import React ,{useState , useEffect,useRef} from "react";
import { NEW_BASE_URL } from "../../data/constant";


  // Plan data
  const PLANS = [
    { id: 'Basic', planName: 'BASIC', price: 999, popular: false },
    { id: 'Pro', planName: 'PRO', price: 2999, popular: true },
    { id: 'Enterprise', planName: 'ENTERPRISE', price: 9999, popular: false }
  ];

  // Apps data
  const APPS_DATA = [
    { name: 'WhatsApp Automation', price: 1000, icon: '💬' },
    { name: 'Lead Management', price: 500, icon: '🎯' },
    { name: 'Exotel Integration', price: 1000, icon: '📞' },
    { name: 'CRM', price: 500, icon: '🗂️' },
    { name: 'Booking Engine + Reservations', price: 1500, icon: '🏨' },
    { name: 'Eazbot', price: 500, icon: '🤖' }
  ];

  const formatPrice = (num) => `₹${num.toLocaleString('en-IN')}`;

  // Individual Plan Card Component
  const PlanCard = ({ plan, isSelected, onSelect }) => {

    // console.log("Rendering PlanCard:", plan.planName, "Selected:", isSelected);
    const priceFormatted = formatPrice(plan.price);
    const formatModuleName = (key) => {
      const map = {
        corePlatform: "Core Platform",
        aiLayer: "AI Layer",
        analytics: "Analytics",
        automation: "Automation",
        integrations: "Integrations",
        unlimitedLocation:"Unlimited Location",
      };

      return map[key] || key;
    };
    return (
      <div 
        className={`  relative bg-white border! rounded-xl p-5 cursor-pointer transition-all duration-200  hover:border-primary! hover:-translate-y-1 ${isSelected === plan._id ? 'border-navy bg-navy shadow-lg -translate-y-1' : 'border-gray-200'} ${plan.planName==="PRO" && isSelected !== plan._id ? 'border-ternary!' : ''}`}
        onClick={onSelect}
      >
        {plan.planName==="PRO" && isSelected !== plan._id && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ternary! text-white text-[11px] font-bold tracking-wide uppercase px-3.5 py-1 rounded-full whitespace-nowrap shadow-md z-99999">
            Most popular
          </div>
        )}
        <div className={`text-[11px] font-bold tracking-wider uppercase mb-1.5 text-gray-400`}>
          {plan.planName}
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className={`text-3xl font-bold tracking-tight `}>{priceFormatted}</span>
          <span className={`text-xs font-medium text-gray-400`}>/mo</span>
        </div>
        <div className={`text-[12.5px] leading-snug mt-2 mb-4 text-gray-600`}>
          {plan.planName === 'BASIC' && 'Perfect for small hotels starting their journey toward direct bookings and digital growth.'}
          {plan.planName === 'PRO' && 'Best value for growing hotels with multichannel automation and advanced tools.'}
          {plan.planName === 'ENTERPRISE' && 'Full-suite for large properties needing advanced integrations and dedicated support.'}
        </div>
        <button className={`w-full py-2.5 px-3 rounded-sm text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-all ${isSelected === plan._id ? 'border border-white/35 bg-white/15 text-gray-600 hover:bg-white/25' : 'border border-navy bg-transparent text-navy hover:bg-navy'}`}>
          <span className={`check-icon ${isSelected===plan._id ? 'inline-flex items-center justify-center w-3.5 h-3.5 bg-green-500 rounded-full' : 'hidden'}`}>
            <svg className="w-2 h-2 text-white" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1.5 5.5 4.5 8.5 10.5 2"></polyline></svg>
          </span>
          <span>{isSelected === plan._id ? 'Selected' : 'Select plan'}</span>
        </button>

        <div>
  {Object.values(plan.modules).some(Boolean) && (
    <div className="mt-4">
      <div className="text-[10.5px] font-bold tracking-wide uppercase text-gray-400 mb-1.5">
        Includes
      </div>

      <ul className="text-sm text-gray-600 space-y-1">
        {Object.entries(plan.modules)
          .filter(([_, value]) => value)
          .map(([key]) => (
            <li key={key} className="flex items-center gap-2">
              <span className="text-green-500">✔</span>
              {formatModuleName(key)}
            </li>
          ))}
      </ul>
    </div>
  )}
</div>
      </div>
    );
  };

  // App Card Component
  const AppCard = ({ app, isSelected, onToggle, locked }) => {
    const IconMap = {
      'WhatsApp Chat': '💬',
      'Lead Management': '🎯',
      'Exotel Integration': '📞',
      'CRM': '🗂️',
      'Booking Engine + Reservation Desk': '🏨',
      'Eazbot': '🤖',
      'Webhook': '🔗',
      'WordPress Webhook': '🧩',
      'GRM': '📊',
      'Meta Leads': '📈',
    };
    console.log("Rendering AppCard:", app.name, "Selected:", isSelected, "Locked:", locked);
    return (
      <div className={`bg-white border rounded-xl p-3 flex items-center justify-between gap-3 transition-all duration-200 ${locked ? 'opacity-50 pointer-events-none border-gray-200' : (isSelected ? 'border-ternary bg-ternary-pale ' : 'border-gray-200 hover:border-navy-muted hover:-translate-y-0.5 ')}`}>
        <div className={`w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-base shrink-0 ${isSelected ? 'bg-ternary/10' : ''}`}>
          {/* {app.icon} */}
          {IconMap[app.name] || '🔌'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-gray-800 truncate">{app.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{formatPrice(app.price)}/month</div>
        </div>
        <button 
          onClick={onToggle} 
          disabled={locked}
          className={`app-toggle shrink-0 w-16 py-1.5 px-2 rounded-full text-xs font-semibold border-2 transition-all text-center ${isSelected ? 'bg-ternary border-ternary text-white hover:bg-ternary-light' : 'border-gray-300 bg-transparent text-gray-600 hover:border-navy hover:text-navy'}`}
        >
          {isSelected ? 'Remove' : 'Add'}
        </button>
      </div>
    );
  };

  // Summary component
  const BillingSummary = ({ selectedPlan, selectedAppsMap, teamCount, appInteracted, onRemoveApp }) => {
    const totalRef = useRef(null);
    const appsTotal = Object.values(selectedAppsMap).reduce((sum, p) => sum + p, 0);
    const teamCost = teamCount * 500;
    const total = selectedPlan ? selectedPlan.price + appsTotal + teamCost : 0;

    useEffect(() => {
      if (totalRef.current && selectedPlan) {
        totalRef.current.classList.remove('total-bump');
        void totalRef.current.offsetWidth;
        totalRef.current.classList.add('total-bump');
      }
    }, [total, selectedPlan]);

    if (!selectedPlan) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
            <div className="text-base font-bold text-navy">Billing summary</div>
            <div className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">Monthly</div>
          </div>
          <div className="text-center py-6">
            <div className="text-3xl mb-2 opacity-35">📋</div>
            <div className="text-xs text-gray-400 leading-relaxed">Select a plan to see<br />your billing summary</div>
          </div>
          <button disabled className="w-full mt-5 py-3.5 rounded-md bg-gray-200 text-gray-400 font-bold text-sm cursor-not-allowed shadow-none">
            Continue to payment →
          </button>
          <div className="flex items-center justify-center gap-1 text-[11.5px] text-gray-400 mt-3">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 4a1 1 0 110 2 1 1 0 010-2z" fill="currentColor" opacity=".5"/></svg>
            No contracts · Cancel anytime
          </div>
        </div>
      );
    }

    const appNames = Object.keys(selectedAppsMap);
    const prorateVisible = appInteracted && appNames.length > 0;

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
          <div className="text-base font-bold text-navy">Billing summary</div>
          <div className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">Monthly</div>
        </div>

        <div>
          {/* Plan Section */}
          <div className="mb-4">
            <div className="text-[10.5px] font-bold tracking-wide uppercase text-gray-400 mb-1.5">Plan</div>
            <div className="flex justify-between items-start gap-2">
              <span className="text-sm text-gray-600 flex-1">{selectedPlan.name} Plan</span>
              <span className="text-sm font-semibold text-gray-800 shrink-0">{formatPrice(selectedPlan.price)}/mo</span>
            </div>
          </div>

          {/* Apps Section */}
          {appNames.length > 0 && (
            <div className="mb-4">
              <div className="text-[10.5px] font-bold tracking-wide uppercase text-gray-400 mb-1.5">Add-on apps</div>
              <div className="space-y-1">
                {appNames.map(name => {
                  const price = selectedAppsMap[name];
                  return (
                    <div key={name} className="flex justify-between items-center py-1 text-[12.5px]">
                      <span className="text-gray-600">{name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800">{formatPrice(price)}</span>
                        <button 
                          onClick={() => onRemoveApp(name)} 
                          className="text-gray-300 hover:text-ternary text-base leading-4 font-bold transition"
                          title="Remove"
                        >×</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Section */}
          <div className="mb-3">
            <div className="text-[10.5px] font-bold tracking-wide uppercase text-gray-400 mb-1.5">Team</div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{teamCount} × ₹500</span>
              <span className="text-sm font-semibold text-gray-800">{formatPrice(teamCost)}/mo</span>
            </div>
          </div>

          <hr className="my-3 border-gray-200" />

          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[15px] font-bold text-navy">Total due today</span>
            <span ref={totalRef} className="text-[28px] font-bold text-navy tracking-tight transition-all">{formatPrice(total)}/mo</span>
          </div>

          {prorateVisible && (
            <div className="mt-2 p-2 bg-ternary-pale border border-ternary-border rounded-sm text-[11.5px] text-ternary leading-relaxed">
              ⚡ Apps added mid-cycle are charged on a prorated basis.
            </div>
          )}
        </div>

        <button 
          onClick={() => {
            const appList = Object.keys(selectedAppsMap).join(', ') || 'None';
            alert(`Proceeding to payment!\n\nPlan: ${selectedPlan.name}\nApps: ${appList}\nTeam: ${teamCount}\n\nTotal: ${formatPrice(total)}/month`);
          }}
          className="w-full mt-5 py-3.5 rounded-md bg-ternary text-white font-bold text-sm hover:bg-ternary-light transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
        >
          <span>Continue to payment</span>
          <span className="text-lg transition-transform group-hover:translate-x-0.5">→</span>
        </button>
        <div className="flex items-center justify-center gap-1 text-[11.5px] text-gray-400 mt-3">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 4a1 1 0 110 2 1 1 0 010-2z" fill="currentColor" opacity=".5"/></svg>
          No contracts · Cancel anytime
        </div>
      </div>
    );
  };

  // Main App Component
const Billing = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedAppsMap, setSelectedAppsMap] = useState({});
    const [teamCount, setTeamCount] = useState(1);
    const [appInteracted, setAppInteracted] = useState(false);

    const handlePlanSelect = (plan) => {
      setSelectedPlan(plan);
    };

    const handleToggleApp = (app) => {
      setSelectedAppsMap(prev => {
        const newMap = { ...prev };
        if (newMap[app.name]) {
          delete newMap[app.name];
        } else {
          newMap[app.name] = app.price;
          setAppInteracted(true);
        }
        return newMap;
      });
    };

    const handleRemoveApp = (appName) => {
      setSelectedAppsMap(prev => {
        const newMap = { ...prev };
        delete newMap[appName];
        return newMap;
      });
    };

    const handleTeamChange = (delta) => {
      setTeamCount(prev => Math.max(1, prev + delta));
    };

    const isPlanSelected = (planId) => {
      if(selectedPlan && selectedPlan._id === planId) {
        return planId;
      }
      return false;
    };

    const appsLocked = !selectedPlan;

    const [plans, setPlans] = useState([]);
    const [apps, setApps] = useState([]);

    const fetchPlans = async () => {
      try {
        const response = await axios.get(
          `${NEW_BASE_URL}/api/v1/subscription/plans`,
        );
        const data = response.data;
        setPlans(data?.result?.data.plans);
        setApps(data?.result?.data.apps);
        // Assuming the API returns an object with a 'plans' array
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    useEffect(() => {
      fetchPlans();
    }, []);



    return (
      <div className="bg-[#f8f9fc]">

      <div className="max-w-280 mx-auto px-4 sm:px-6 py-8 md:py-12 ">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 bg-ternary-pale text-ternary text-[11px] font-semibold tracking-wide uppercase px-3.5 py-1 rounded-full border border-ternary-border mb-4">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.3 2.6 2.9.4-2.1 2 .5 2.9L6 7.5 3.4 8.9l.5-2.9-2.1-2 2.9-.4L6 1z" fill="currentColor"/></svg>
            Hotel Growth Platform
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight leading-tight mb-2">Choose your plan &amp; customize your tools</h1>
          <p className="text-base text-gray-600 max-w-md mx-auto leading-relaxed">Start with a base plan, then add only the tools you need. Transparent pricing, no surprises.</p>
        </header>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Plans Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400">Base plan — required</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {plans.map(plan =>{
                  if (!plan.price) return null;
                  return (
                    <PlanCard 
                      key={plan._id}
                      plan={plan}
                      isSelected={isPlanSelected(plan._id)}
                      onSelect={() => handlePlanSelect(plan)}
                    />
                  );
                } )}
              </div>
            </div>

            {/* Apps Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400">Add apps to your plan</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Locked banner */}
              {appsLocked && (
                <div className="flex items-center gap-2.5 bg-gray-100 border border-dashed border-gray-400 rounded-xl p-3 mb-3 text-sm text-gray-600">
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-sm shrink-0">🔒</div>
                  <span>Select a base plan above to enable add-on apps</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {apps.map(app => (
                  <AppCard 
                    key={app._id}
                    app={app}
                    isSelected={!!selectedAppsMap[app.name]}
                    onToggle={() => handleToggleApp(app)}
                    locked={appsLocked}
                  />
                ))}
              </div>
            </div>

            {/* Team Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400">Team members</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div className="bg-white border border-gray-200 rounded-md p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Additional seats</div>
                  <div className="text-xs text-gray-400 mt-0.5">₹500 per member / month</div>
                </div>
                <div className="flex items-center bg-gray-100 border-2 border-gray-200 rounded-sm overflow-hidden">
                  <button 
                    onClick={() => handleTeamChange(-1)} 
                    className="w-9 h-9 flex items-center justify-center text-lg text-gray-800 hover:bg-navy hover:text-white transition-all"
                  >−</button>
                  <div className="w-12 text-center text-sm font-bold text-navy border-l border-r border-gray-200">{teamCount}</div>
                  <button 
                    onClick={() => handleTeamChange(1)} 
                    className="w-9 h-9 flex items-center justify-center text-lg text-gray-800 hover:bg-navy hover:text-white transition-all"
                  >+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Billing Summary */}
          <BillingSummary 
            selectedPlan={selectedPlan}
            selectedAppsMap={selectedAppsMap}
            teamCount={teamCount}
            appInteracted={appInteracted}
            onRemoveApp={handleRemoveApp}
          />
        </div>
      </div>
      </div>

    );
  };


  export default Billing;
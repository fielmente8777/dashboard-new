import { useEffect, useState } from 'react'
import { editNotificationData, getNotificationData } from '../../services/api/notification.api';
import { fetchUserManagementData } from '../../services/api/userManagement.api';
import CustomDropdown from '../../components/ui/Dropdown';

const Notification = () => {
    const initialData = {
        webform: {
            email: "",
            phone: "",
            isPhoneAllowed: false,
            isEmailAllowed: false,
        },
        eazbot: {
            email: "",
            phone: "",
            isPhoneAllowed: false,
            isEmailAllowed: false,
        },
        facebook: {
            email: "",
            phone: "",
            isPhoneAllowed: false,
            isEmailAllowed: false,
        },
        whatsapp: {
            email: "",
            phone: "",
            isPhoneAllowed: false,
            isEmailAllowed: false,
        },
        google: {
            email: "",
            phone: "",
            isPhoneAllowed: false,
            isEmailAllowed: false,
        },
    };
    const [data, setData] = useState(initialData);
    const [allUsers, setAllUsers] = useState();

    const fetchNofiticationData = async () => {
        try {
            const data = await getNotificationData();
            if(data.result.docs){
                setData(data.result?.docs?.config)

            }
        } catch (error) {

        }
    }
    const editNofiticationData = async (payload) => {
        try {
            const res = await editNotificationData(payload);
            console.log("Updated Successfully", res);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUsersData = async () => {
        const token = localStorage.getItem("token");
        const usersData = await fetchUserManagementData(token);
        setAllUsers(usersData);
    };

    const handleUserAssign = (source, type, value) => {
        setData((prev) => {
            const updated = {
                ...prev,
                [source]: {
                    ...prev[source],
                    [type]: value ||"",
                },
            };

            console.log("Updated payload",updated);
            editNofiticationData(updated);

            return updated;
        });
    };

    const toggleActive = (source, type) => {
        const key = type === "email" ? "isEmailAllowed" : "isPhoneAllowed";

        setData((prev) => 
            {
            const updated={
                ...prev,
                [source]: {
                    ...prev[source],
                    [key]: !prev[source][key],
                },
            }
            editNofiticationData(updated);
            return updated;
        });
    };


    useEffect(() => {
        setData(initialData)
        fetchUsersData()
        fetchNofiticationData()
    }, []);

    const tab = ["webform", "eazbot", "whatsapp", "facebook", "google"];

    console.log(data)
    return (
        <div className='p-5'>

            <h1 className='text-md font-medium max-w-300 mx-auto mb-5'>Notification Config</h1>
            <div className=''>

                <table className="w-full bg-white  max-w-300 mx-auto border  rounded  overflow-hidden border-collapse">
                    <thead> 
                        <tr className="border">
                            <th className="p-2 text-left font-medium text-gray-600">Source</th>
                            <th className="p-2 text-left font-medium text-gray-600">Email Notification</th>
                            <th className="p-2 text-left font-medium text-gray-600">Whatsapp Notification</th>
                        </tr>
                    </thead>

                    <tbody>
                        {tab?.map((item) => (
                            <tr key={item} className="border-b">
                                <td className="p-2 capitalize  text-sm font-medium text-gray-600">{item}</td>

                                {/* EMAIL */}
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        <CustomDropdown
                                            label={data[item]?.email || "Select email"}
                                            options={
                                                allUsers?.map((user) => ({
                                                    value: user?.emailId,
                                                    label: user?.userName,
                                                })) || []
                                            }
                                            onChange={(value) =>
                                                handleUserAssign(item, "email", value)
                                            }
                                        />

                                        <button
                                            className={`px-2 py-1 flex items-center rounded-full text-xs text-white ${data[item]?.isEmailAllowed===true
                                                ? "bg-green-500!"
                                                : "bg-gray-400"
                                                }`}
                                            onClick={() => toggleActive(item, "email")}
                                        >
                                            {data[item]?.isEmailAllowed ? "Active" : "Inactive"}
                                        </button>
                                    </div>
                                </td>

                                {/* WHATSAPP */}
                                <td className="p-2">
                                    <div className="flex items-center gap-2">
                                        <CustomDropdown
                                            label={data[item]?.phone || "Select whatsapp"}
                                            options={
                                                allUsers?.map((user) => ({
                                                    value: user?.phone,
                                                    label: user?.userName,
                                                })) || []
                                            }
                                            onChange={(value) =>
                                                handleUserAssign(item, "phone", value)
                                            }
                                        />

                                        <button
                                            className={`px-2 py-1 flex items-center rounded-full text-xs text-white ${data[item]?.isPhoneAllowed
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                                }`}
                                            onClick={() => toggleActive(item, "phone")}
                                        >
                                            {data[item]?.isPhoneAllowed ? "Active" : "Inactive"}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Notification
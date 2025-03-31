import { useLocation, Link } from "react-router-dom";

const Breadcrumb = () => {
    const location = useLocation();
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
        <p className="text-[14px] text-[#575757]/70 font-medium mb-4">
            {pathnames.length > 0 && (
                <>
                    <Link to="/" className="text-blue-600 hover:underline">
                        Dashboard
                    </Link>{" "}
                    {">"}{" "}
                </>
            )}

            {pathnames.map((name, index) => {
                // const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
                const routeTo = `/`;
                const formattedName =
                    name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, " ");

                return index === pathnames.length - 1 ? (
                    <span key={index}>{formattedName}</span>
                ) : (
                    <span key={index}>
                        <Link to={routeTo} className="text-blue-600 hover:underline">
                            {formattedName}
                        </Link>{" "}
                        {">"}{" "}
                    </span>
                );
            })}
        </p>
    );
};

export default Breadcrumb;

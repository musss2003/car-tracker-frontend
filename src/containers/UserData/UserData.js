import UserProfile from "../../components/UserProfile/UserProfile";
import { useAuth } from "../../contexts/useAuth";


function UserData() {
    const { user } = useAuth();
    return (
        <>
            <UserProfile userId={user.id} />
        </>
    );
}

export default UserData;
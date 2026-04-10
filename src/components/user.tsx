type UserLike = {
    imageUrl?: string;
    image?: string;
    fullName?: string;
    name?: string;
    primaryEmailAddress?: {
        emailAddress?: string;
    };
    email?: string;
};

export default function User({ data }: { data: UserLike | null }) {

    const avatar = data?.imageUrl || data?.image || "/images/aquaprofile.png";
    const displayName = data?.fullName || data?.name || "Usuario";
    const email = data?.primaryEmailAddress?.emailAddress || data?.email || "Sin correo";

    return (
        <div className="flex p-4 @container">
            <div className="flex w-full flex-col gap-4 items-center">
                <div className="flex gap-4 flex-col items-center">
                    <div className="avatar">
                        <div className="ring-primary ring-offset-base-100 w-24 rounded-full ring-2 ring-offset-2">
                            <img src={avatar} alt="avatar" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center justify-center">
                        <p className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-center text-white">{displayName}</p>
                        <p className="text-base font-normal leading-normal text-center text-white">{email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}


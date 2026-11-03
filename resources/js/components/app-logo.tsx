export default function AppLogo() {
    return (
        <>
            <span className="grid aspect-square size-8 place-items-center overflow-hidden rounded-full bg-white">
                <img
                    src="/images/ched-seal.webp"
                    alt=""
                    width={162}
                    height={160}
                    className="size-full object-contain"
                />
            </span>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    CHED RO XII
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Content Manager
                </span>
            </div>
        </>
    );
}

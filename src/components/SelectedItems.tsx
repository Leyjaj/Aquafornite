import { useCurrency } from "@/hooks/useCurrency";

interface Option{
    id:string|number
    label:string
    icon?:React.ReactNode
}

interface CustomSelectProps{
    options:Option[]
    value?:Option
    onChange:(option:Option)=>void
}

export default function SelectedItems({options, value, onChange}:CustomSelectProps) {

    const { currency, setCurrency } = useCurrency()

    const selected =
        options.find((option) => String(option.label).toUpperCase() === String(currency).toUpperCase()) ||
        options[0];

    const handleSelect = (option: Option) =>{
        setCurrency(option.label)
        if(onChange) onChange(option)
    }

    return (

        <div className="dropdown dropdown-end">

            <div
                tabIndex={0}
                role="button"
                className="btn btn-sm md:btn-md m-0 h-9 min-h-9 px-2 md:h-10 md:min-h-10 md:px-3 bg-transparent border-none text-white hover:bg-white/10"
            >
                {selected.icon}
                <span className="text-xs md:text-sm">{selected.label}</span>
            </div>

            <ul
                tabIndex={0}
                className="dropdown-content menu bg-[#0b1c3f] text-white rounded-box z-[1000] w-44 p-2 shadow-lg border border-white/10 backdrop-blur-md"
            >

                {options.map(option => (

                    <li key={option.id}>

                        <button
                            onClick={() => handleSelect(option)}
                            className="flex items-center gap-2 hover:bg-white/10 rounded-lg"
                        >
                            {option.icon}
                            {option.label}
                        </button>

                    </li>

                ))}

            </ul>

        </div>

    )
}

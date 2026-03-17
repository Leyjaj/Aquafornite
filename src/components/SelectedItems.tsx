import { useCurrency } from "@/hooks/useCurrency";
import { useState } from "react";

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

    const [selected, setSelected] = useState(options[0]);
    const { setCurrency } = useCurrency()

    const handleSelect = (option: Option) =>{
        setSelected(option)
        setCurrency(option.label)
        if(onChange) onChange(option)
    }

    return (

        <div className="dropdown dropdown-end">

            <div
                tabIndex={0}
                role="button"
                className="btn m-1 bg-transparent border-none text-white hover:bg-white/10"
            >
                {selected.icon} {selected.label}
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
import { faCircleXmark, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const InputSearchName = ({ textSearch, setTextSearch }) => {
    return (
        <div className="flex items-center p-2 bg-white rounded-[5px] h-[35px] w-3/5 hover:bg-gray-100 border border-gray-200">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-500" size="35" />
            <input type="text" placeholder="Tìm bạn"
                className="pl-2 h-[30px] focus:outline-none focus:border-none focus:ring-0 w-[95%] hover:bg-gray-100 bg-white"
                value={textSearch} onChange={(e) => setTextSearch(e.target.value)} />
            {textSearch && (
                <FontAwesomeIcon icon={faCircleXmark} className="text-gray-500" size="15" onClick={() => setTextSearch("")} />
            )}
        </div>
    );
}

export default InputSearchName;
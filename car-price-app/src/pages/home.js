import React, { useState, useEffect} from 'react'


import '../App.css'

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState({});
    const [trims, setTrims] = useState([])
    const [colors, setColors] = useState([])
    const [price, setPrice] = useState(null);
    const [step, setStep] = useState(1);

    const [selectedMake, setSelectedMake] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedTrim, setSelectedTrim] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [year, setYear] = useState('');
    const [mileage, setMileage] = useState('');
    const [engineSize, setEngineSize] = useState('');
    const [gasMileage, setGasMileage] = useState('');
    const [location, setLocation] = useState('');
    const [transmission, setTransmission] = useState('');
    const [fuelType, setFuelType] = useState('');
    const [driveType, setDriveType] = useState('');
    const transmissions = ['Automatic', 'Manual', 'CVT'];
    const driveTypes = ['FWD', 'AWD', 'RWD'];
    const fuelTypes = ['Gas', 'Hybrid','Electric']

    useEffect(() => {
        fetch('/makes-models')
        .then(response => {
        if (!response.ok){
            throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then(data => {
            setMakes(data.makes);
            setModels(data.models);
            setLoading(false);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation', error);
            setLoading(false);
        });
    }, []);

  
    const handleMakeChange = (e) => {
        setSelectedMake(e.target.value); 
        setSelectedModel(''); // reset model selection when make changes
    }

    const handleContinue = async (e) => {
        e.preventDefault();
        if (selectedMake && selectedModel) {
            try{
                setLoading(true)
                const trims = await fetch(`/trims?make=${selectedMake}&model=${selectedModel}`)
                const colors = await fetch(`/colors?make=${selectedMake}&model=${selectedModel}`)
                if (!trims.ok || !colors.ok){
                    throw new Error('Network response was not ok')
                }
                const trims_list = await trims.json()
                const color_list = await colors.json()
                setTrims(trims_list.trims);
                setColors(color_list.colors);
                setStep(2);  // Move to the next step
                setLoading(false)
            } 
            catch (error){
                console.error('There was a problem with the fetch operation')
                setLoading(false)
            }
            
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault()
        try{
            setLoading(true)
            const predictUrl = `/predict?
            make=${encodeURIComponent(selectedMake)}
            &model=${encodeURIComponent(selectedModel)}
            &zip=${encodeURIComponent(location)}
            &year=${encodeURIComponent(year)}
            &trim=${encodeURIComponent(selectedTrim)}
            &mileage=${encodeURIComponent(mileage)}
            &engine=${encodeURIComponent(engineSize)}
            &gas=${encodeURIComponent(gasMileage)}
            &transmission=${encodeURIComponent(transmission)}
            &fuel=${encodeURIComponent(fuelType)}
            &drive=${encodeURIComponent(driveType)}`;

            const response = await fetch(predictUrl);
            if (!response.ok){
                throw new Error('Network response was not ok')
            }
            const data = await response.json()
            setPrice(data.predicted_value);
            setLoading(false)
        }
        catch (error){
            console.error('There was a problem with the fetch operation')
            setLoading(false)
        }
        
    
    }

    if (loading){
        return <div className='App'><p>Loading...</p></div>;
    }

    return (
        <div className="Home">
        <header className="Home-header"> 
            <p>Enter Information</p>
            <div>
            <form onSubmit={step === 1 ? handleContinue: handleSubmit}>
                {step === 1 && (
                    <>
                        <select value={selectedMake} onChange={handleMakeChange}>
                            <option value="">Select Make</option>
                            {makes.map(make => (
                                <option key={make} value={make}>{make}</option>
                            ))}
                        </select>
                        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
                            <option value="">Select Model</option>
                            {selectedMake && models[selectedMake].map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                        <button type='submit'>Continue</button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <input 
                            type="text" 
                            placeholder='Enter Your Zip Code' 
                            onChange={(e) => setLocation(e.target.value)}>
                        </input>
                        <input
                            type="text"
                            placeholder="Year"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                        />
                        <select value={selectedTrim} onChange={(e) => setSelectedTrim(e.target.value)}>
                            <option value="">Select Trim</option>
                            {trims.map(trim => (
                                <option key={trim} value={trim}>{trim}</option>
                            ))}
                        </select>
                        <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
                            <option value="">Select Color</option>
                            {colors.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Mileage"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Engine Size"
                            value={engineSize}
                            onChange={(e) => setEngineSize(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Gas Mileage"
                            value={gasMileage}
                            onChange={(e) => setGasMileage(e.target.value)}
                        />
                        <select value={transmission} onChange={(e) => setTransmission(e.target.value)}>
                            <option value="">Select Transmission</option>
                            {transmissions.map(trans => (
                                <option key={trans} value={trans}>{trans}</option>
                            ))}
                        </select>

                        <select value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
                            <option value="">Select Fuel Type</option>
                            {fuelTypes.map(fuel => (
                                <option key={fuel} value={fuel}>{fuel}</option>
                            ))}
                        </select>

                        <select value={driveType} onChange={(e) => setDriveType(e.target.value)}>
                            <option value="">Select Drive Type</option>
                            {driveTypes.map(drive => (
                                <option key={drive} value={drive}>{drive}</option>
                            ))}
                        </select>
                        <button type="submit" onClick={handleSubmit}>Find Price</button>
                    </>
                )}
                
            </form>
            {price && <p>Estimated Price: ${price}</p>}
            </div>
        </header>
        </div>
    );
    }

export default Home;

import React, { useState, useEffect} from 'react'


import '../App.css'

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState({});
    const [selectedMake, setSelectedMake] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const [zip, setZip] = useState('');
    const [year, setYear] = useState('');
    const [selectedTrim, setSelectedTrim] = useState('');
    const [trims, setTrims] = useState([])
    const [mileage, setMileage] = useState('');
    const [price, setPrice] = useState(null);
    const [step, setStep] = useState(1);
  
  

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
        if (selectedMake && selectedModel && zip) {
            try{
                setLoading(true)
                const response = await fetch(`/trims?make=${selectedMake}&model=${selectedModel}&zip=${zip}`)
                if (!response.ok){
                    throw new Error('Network response was not ok')
                }
                const data = await response.json()
                setTrims(data.trims);
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
        if (year && selectedTrim && mileage){
            try{
                setLoading(true)
                await fetch(`/data?make=${selectedMake}&model=${selectedModel}&zip=${zip}`)
                const response = await fetch(`/predict?make=${selectedMake}&model=${selectedModel}&zip=${zip}&year=${year}&trim=${selectedTrim}&miles=${mileage}`)
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
                        <input name="zip" placeholder='Enter Your Zip Code' onChange={(e) => setZip(e.target.value)}></input>
                        <button type='submit'>Continue</button>
                    </>
                )}

                {step === 2 && (
                    <>
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
                        <input
                            type="text"
                            placeholder="Mileage"
                            value={mileage}
                            onChange={(e) => setMileage(e.target.value)}
                        />
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

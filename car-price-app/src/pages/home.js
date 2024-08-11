import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Card, Col, Container, Form, InputGroup, Row, Spinner } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import '../App.css'

const schema = yup.object().shape({
    make: yup.string().required("Please select car make"),
    model: yup.string().required("Please select car model"),
    year: yup.string().required("Year is required"),
    trim: yup.string().required("Please select car trim"),
    color: yup.string().required("Please select car color"),
    mileage: yup.string().required("Please select car mileage"),
    gasMileage: yup.string().required("Please select car gas mileage"),
    engineSize: yup.string().required("Please select car engine size"),
    transmission: yup.string().required("Please select car transmission"),
    driveType: yup.string().required("Please select car drive type"),
    location: yup.string().required("Please enter zip code"),
    fuelType: yup.string().required("Please select car fuel type"),

});


const Home = () => {
    const [loading, setLoading] = useState(false);
    const [makes, setMakes] = useState([]);
    const [models, setModels] = useState({});
    const [price, setPrice] = useState(null);


    useEffect(() => {
        fetch('/makes-models')
            .then(response => {
                if (!response.ok) {
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

    const CarPrediction = () => {

        const [smodel, setSModel] = useState();
        const [carTrims, setCarTrims] = useState();
        const [carColor, setCarColor] = useState();
        const transmissions = ['Automatic', 'Manual', 'CVT'];
        const driveTypes = ['FWD', 'AWD', 'RWD'];
        const fuelTypes = ['Gas', 'Hybrid', 'Electric']


        const handleCarMakeChange = (e) => {
            setSModel(models[e]);
            setCarColor(...[]);
            setCarTrims(...[]);
        }

        const findTrims = async (model) => {
            const trims = await fetch(`/trims?make=${getValues('make')}&model=${model}`)
            const colors = await fetch(`/colors?make=${getValues('make')}&model=${model}`)
            if (!trims.ok || !colors.ok) {
                throw new Error('Network response was not ok')
            }
            const trims_list = await trims.json()
            const color_list = await colors.json()
            console.log(trims_list)
            setCarTrims(trims_list.trims);
            setCarColor(color_list.colors);
        }

        const ErrorMessage = (message) => {
            return (
                <span className='text-danger'>{message.message}</span>
            )
        }

        const {
            register,
            setValue,
            getValues,
            handleSubmit,
            formState: { errors }
        } = useForm(
            {
                resolver: yupResolver(schema),
                mode: "onChange"
            });

        const onSubmit = async (data) => {
            try {
                setLoading(true);
                const response = await fetch('/predict',
                    {
                        method: 'post',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                const res = await response.json();
                console.log('response', res)
                setPrice(await res.predicted_value)
                setLoading(false);
            }
            catch (e) {
                console.log(e);
                setLoading(false);
            }
        };

        return (
            <>
                <Container className='w-75 mt-4' >
                    {price && <Alert variant='success'>Car Pridicted Price : <b>{price}</b></Alert>}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Card className="bg-light" style={{ borderRadius: 0 }} >
                            <Card.Body>
                                <Card.Title>Enter Car Information </Card.Title><hr></hr>

                                <Row className="mb-3">
                                    <Col md="2" >Make</Col>
                                    <Col md="10" >
                                        <Form.Select   {...register("make")} onChange={(e) => {
                                            handleCarMakeChange(e.target.value)
                                        }}>
                                            <option value=''>Select Make</option>
                                            {makes.map(make => (
                                                <option key={make} value={make}>{make}</option>
                                            ))}
                                        </Form.Select>
                                        {errors && errors.make?.message && <ErrorMessage message={errors.make?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3" >
                                    <Col md="2" >Model</Col>
                                    <Col md="10" >
                                        <Form.Select {...register("model")} onChange={(e) => findTrims(e.target.value)}>
                                            <option value='' >Select Model</option>
                                            {smodel && smodel.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                        </Form.Select>
                                        {errors && errors.model?.message && <ErrorMessage message={errors.model?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3" >
                                    <Col md="2" >Year</Col>
                                    <Col md="10" >
                                        <Form.Control type="text" placeholder="year" {...register("year")} />
                                        {errors && errors.year?.message && <ErrorMessage message={errors.year?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md="2" >Trim</Col>
                                    <Col md="10" >
                                        <Form.Select {...register("trim")}  >
                                            <option value='' >Select Trim</option>
                                            {carTrims && carTrims.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </Form.Select>
                                        {errors && errors.trim?.message && <ErrorMessage message={errors.trim?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md="2" >Color</Col>
                                    <Col md="10" >
                                        <Form.Select {...register("color")}  >
                                            <option value='' >Select Color</option>
                                            {carColor && carColor.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </Form.Select>
                                        {errors && errors.color?.message && <ErrorMessage message={errors.color?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md="2" >Mileage</Col>
                                    <Col md="10" >
                                        <Form.Control type="text" placeholder="mileage" {...register("mileage")} />
                                        {errors && errors.mileage?.message && <ErrorMessage message={errors.mileage?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md="2" >Engine Size</Col>
                                    <Col md="10" >
                                        <Form.Control type="text" placeholder="engineSize" {...register("engineSize")} />
                                        {errors && errors.engineSize?.message && <ErrorMessage message={errors.engineSize?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md="2" >Gas Mileage</Col>
                                    <Col md="10" >
                                        <Form.Control type="text" placeholder="gas milage" {...register("gasMileage")} />
                                        {errors && errors.gasMileage?.message && <ErrorMessage message={errors.gasMileage?.message} />}
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col md="2" >Transmission</Col>
                                    <Col md="10" >
                                        <Form.Select {...register("transmission")} >
                                            <option value='' >Select Transmission</option>
                                            {transmissions && transmissions.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </Form.Select>
                                        {errors && errors.transmission?.message && <ErrorMessage message={errors.transmission?.message} />}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md="2" >Fuel Type</Col>
                                    <Col md="10" >
                                        <Form.Select {...register("fuelType")} className="mb-3" >
                                            <option value='' >Select Fuel Type</option>
                                            {fuelTypes && fuelTypes.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </Form.Select>
                                        {errors && errors.fuelType?.message && <ErrorMessage message={errors.fuelType?.message} />}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md="2" >Drive Type</Col>
                                    <Col md="10" >
                                        <Form.Select {...register("driveType")} className="mb-3" >
                                            <option value='' >Select Drive Type</option>
                                            {driveTypes && driveTypes.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </Form.Select>
                                        {errors && errors.driveType?.message && <ErrorMessage message={errors.driveType?.message} />}
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md="2" >Zip Code</Col>
                                    <Col md="10" >
                                        <Form.Control type="text" placeholder="zip code" {...register("location")} />
                                        {errors && errors.location?.message && <ErrorMessage message={errors.location?.message} />}
                                    </Col>
                                </Row>
                                
                                <Button type='submit' variant='dark'>Predict {loading ? <Spinner size='sm'></Spinner> : ""}</Button>

                            </Card.Body>
                        </Card>
                    </form>
                </Container>
            </>
        )
    }

    return (
        <>
            <CarPrediction />
        </>
    );
}

export default Home;

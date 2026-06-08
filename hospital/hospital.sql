-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 11-05-2026 a las 15:42:41
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `hospital`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consultas`
--

CREATE TABLE `consultas` (
  `id_consulta` int(11) NOT NULL,
  `nombre_paciente` varchar(100) DEFAULT NULL,
  `motivo_consulta` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `consultas`
--

INSERT INTO `consultas` (`id_consulta`, `nombre_paciente`, `motivo_consulta`, `ciudad`) VALUES
(1, 'Juan Perez', 'Dolor de cabeza', 'Ciudad Juarez'),
(2, 'Maria Lopez', 'Fiebre alta', 'Chihuahua'),
(3, 'Carlos Ramirez', 'Chequeo general', 'Monterrey'),
(4, 'Ana Torres', 'Dolor estomacal', 'CDMX'),
(5, 'Luis Hernandez', 'Dolor muscular', 'Puebla'),
(6, 'Sofia Martinez', 'Migraña', 'Guadalajara'),
(7, 'Pedro Sanchez', 'Presion alta', 'Tijuana'),
(8, 'Laura Diaz', 'Tos constante', 'Toluca'),
(9, 'Miguel Castro', 'Infeccion', 'Cancun'),
(10, 'Fernanda Ruiz', 'Dolor de espalda', 'Leon'),
(11, 'Jose Morales', 'Fiebre y gripe', 'Merida'),
(12, 'Patricia Vega', 'Alergia', 'Saltillo'),
(13, 'Daniel Ortega', 'Fractura', 'Durango'),
(14, 'Carmen Flores', 'Asma', 'Veracruz'),
(15, 'Jorge Navarro', 'Dolor de pecho', 'Tampico'),
(16, 'Lucia Campos', 'Chequeo medico', 'Mazatlan'),
(17, 'Ricardo Luna', 'Problemas digestivos', 'Oaxaca'),
(18, 'Elena Rios', 'Dolor de garganta', 'Queretaro'),
(19, 'Oscar Medina', 'Infeccion urinaria', 'Aguascalientes'),
(20, 'Gabriela Soto', 'Ansiedad', 'Hermosillo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `doctores`
--

CREATE TABLE `doctores` (
  `id_doctor` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `especialidad` varchar(100) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `doctores`
--

INSERT INTO `doctores` (`id_doctor`, `nombre`, `especialidad`, `ciudad`) VALUES
(1, 'Dr. Luis Gomez', 'Cardiologia', 'Ciudad Juarez'),
(2, 'Dra. Sofia Martinez', 'Pediatria', 'Chihuahua'),
(3, 'Dr. Ricardo Diaz', 'Neurologia', 'Monterrey'),
(4, 'Dra. Elena Cruz', 'Medicina General', 'CDMX'),
(5, 'Dr. Pablo Reyes', 'Traumatologia', 'Puebla'),
(6, 'Dra. Andrea Silva', 'Dermatologia', 'Guadalajara'),
(7, 'Dr. Hector Lara', 'Oncologia', 'Tijuana'),
(8, 'Dra. Monica Perez', 'Psiquiatria', 'Toluca'),
(9, 'Dr. Victor Salas', 'Urologia', 'Cancun'),
(10, 'Dra. Isabel Torres', 'Ginecologia', 'Leon'),
(11, 'Dr. Ramon Flores', 'Oftalmologia', 'Merida'),
(12, 'Dra. Karla Mendoza', 'Endocrinologia', 'Saltillo'),
(13, 'Dr. Javier Ruiz', 'Neumologia', 'Durango'),
(14, 'Dra. Diana Castro', 'Reumatologia', 'Veracruz'),
(15, 'Dr. Ernesto Vega', 'Cirugia General', 'Tampico'),
(16, 'Dra. Teresa Luna', 'Nutricion', 'Mazatlan'),
(17, 'Dr. Omar Campos', 'Otorrinolaringologia', 'Oaxaca'),
(18, 'Dra. Alicia Medina', 'Radiologia', 'Queretaro'),
(19, 'Dr. Fernando Soto', 'Anestesiologia', 'Aguascalientes'),
(20, 'Dra. Paola Herrera', 'Psicologia', 'Hermosillo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `medicamentos`
--

CREATE TABLE `medicamentos` (
  `id_medicamento` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `uso_medicamento` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `medicamentos`
--

INSERT INTO `medicamentos` (`id_medicamento`, `nombre`, `uso_medicamento`, `ciudad`) VALUES
(1, 'Paracetamol', 'Dolor y fiebre', 'Ciudad Juarez'),
(2, 'Ibuprofeno', 'Inflamacion', 'Chihuahua'),
(3, 'Omeprazol', 'Problemas gastricos', 'Monterrey'),
(4, 'Amoxicilina', 'Infecciones bacterianas', 'CDMX'),
(5, 'Aspirina', 'Dolor leve', 'Puebla'),
(6, 'Loratadina', 'Alergias', 'Guadalajara'),
(7, 'Metformina', 'Diabetes', 'Tijuana'),
(8, 'Salbutamol', 'Asma', 'Toluca'),
(9, 'Diclofenaco', 'Dolor muscular', 'Cancun'),
(10, 'Azitromicina', 'Infecciones respiratorias', 'Leon'),
(11, 'Insulina', 'Control de glucosa', 'Merida'),
(12, 'Clonazepam', 'Ansiedad', 'Saltillo'),
(13, 'Naproxeno', 'Inflamacion y dolor', 'Durango'),
(14, 'Ketorolaco', 'Dolor intenso', 'Veracruz'),
(15, 'Ranitidina', 'Acidez estomacal', 'Tampico'),
(16, 'Losartan', 'Hipertension', 'Mazatlan'),
(17, 'Ciprofloxacino', 'Infeccion urinaria', 'Oaxaca'),
(18, 'Prednisona', 'Inflamacion severa', 'Queretaro'),
(19, 'Vitamina C', 'Defensas', 'Aguascalientes'),
(20, 'Tramadol', 'Dolor cronico', 'Hermosillo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `motivo_consulta` varchar(255) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pacientes`
--

INSERT INTO `pacientes` (`id_paciente`, `nombre`, `motivo_consulta`, `ciudad`) VALUES
(1, 'Juan Perez', 'Dolor de cabeza', 'Ciudad Juarez'),
(2, 'Maria Lopez', 'Fiebre alta', 'Chihuahua'),
(3, 'Carlos Ramirez', 'Chequeo general', 'Monterrey'),
(4, 'Ana Torres', 'Dolor estomacal', 'CDMX'),
(5, 'Luis Hernandez', 'Dolor muscular', 'Puebla'),
(6, 'Sofia Martinez', 'Migraña', 'Guadalajara'),
(7, 'Pedro Sanchez', 'Presion alta', 'Tijuana'),
(8, 'Laura Diaz', 'Tos constante', 'Toluca'),
(9, 'Miguel Castro', 'Infeccion', 'Cancun'),
(10, 'Fernanda Ruiz', 'Dolor de espalda', 'Leon'),
(11, 'Jose Morales', 'Fiebre y gripe', 'Merida'),
(12, 'Patricia Vega', 'Alergia', 'Saltillo'),
(13, 'Daniel Ortega', 'Fractura', 'Durango'),
(14, 'Carmen Flores', 'Asma', 'Veracruz'),
(15, 'Jorge Navarro', 'Dolor de pecho', 'Tampico'),
(16, 'Lucia Campos', 'Chequeo medico', 'Mazatlan'),
(17, 'Ricardo Luna', 'Problemas digestivos', 'Oaxaca'),
(18, 'Elena Rios', 'Dolor de garganta', 'Queretaro'),
(19, 'Oscar Medina', 'Infeccion urinaria', 'Aguascalientes'),
(20, 'Gabriela Soto', 'Ansiedad', 'Hermosillo');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `consultas`
--
ALTER TABLE `consultas`
  ADD PRIMARY KEY (`id_consulta`);

--
-- Indices de la tabla `doctores`
--
ALTER TABLE `doctores`
  ADD PRIMARY KEY (`id_doctor`);

--
-- Indices de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  ADD PRIMARY KEY (`id_medicamento`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id_paciente`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `consultas`
--
ALTER TABLE `consultas`
  MODIFY `id_consulta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `doctores`
--
ALTER TABLE `doctores`
  MODIFY `id_doctor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `medicamentos`
--
ALTER TABLE `medicamentos`
  MODIFY `id_medicamento` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

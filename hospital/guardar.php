<?php
include("conexion.php");

$nombre = $_POST['nombre'];
$motivo_consulta = $_POST['motivo_consulta'];
$ciudad = $_POST['ciudad'];

$sql_id = "
SELECT MIN(t1.id_paciente + 1) AS siguiente_id
FROM pacientes t1
LEFT JOIN pacientes t2 ON t1.id_paciente + 1 = t2.id_paciente
WHERE t2.id_paciente IS NULL
";

$resultado = mysqli_query($conexion, $sql_id);
$fila = mysqli_fetch_assoc($resultado);

$id = $fila['siguiente_id'];

if($id == null){
    $id = 1;
}

$sql = "INSERT INTO pacientes (id_paciente, nombre, motivo_consulta, ciudad)
VALUES ('$id', '$nombre', '$motivo_consulta', '$ciudad')";

if(mysqli_query($conexion, $sql)){
    echo "Paciente guardado con éxito.
    <a href='http://localhost/hospital/index.html'>Volver</a>";
} else {
    echo "Error: " . mysqli_error($conexion);
}
?>
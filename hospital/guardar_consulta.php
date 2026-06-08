<?php
include("conexion.php");

$nombre_paciente = $_POST['nombre_paciente'];
$motivo_consulta = $_POST['motivo_consulta'];
$ciudad = $_POST['ciudad'];

$sql_id = "
SELECT MIN(t1.id_consulta + 1) AS siguiente_id
FROM consultas t1
LEFT JOIN consultas t2 ON t1.id_consulta + 1 = t2.id_consulta
WHERE t2.id_consulta IS NULL
";

$resultado = mysqli_query($conexion, $sql_id);
$fila = mysqli_fetch_assoc($resultado);

$id = $fila['siguiente_id'];

if($id == null){
    $id = 1;
}

$sql = "INSERT INTO consultas (id_consulta, nombre_paciente, motivo_consulta, ciudad)
VALUES ('$id', '$nombre_paciente', '$motivo_consulta', '$ciudad')";

if(mysqli_query($conexion, $sql)){
    echo "Consulta registrada. <a href='http://localhost/hospital/index.html'>Volver</a>";
} else {
    echo "Error: " . mysqli_error($conexion);
}
?>
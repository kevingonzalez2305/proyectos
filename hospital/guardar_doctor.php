<?php
include("conexion.php");

$nombre = $_POST['nombre'];
$especialidad = $_POST['especialidad'];
$ciudad = $_POST['ciudad'];

$sql_id = "
SELECT MIN(t1.id_doctor + 1) AS siguiente_id
FROM doctores t1
LEFT JOIN doctores t2 ON t1.id_doctor + 1 = t2.id_doctor
WHERE t2.id_doctor IS NULL
";

$resultado = mysqli_query($conexion, $sql_id);
$fila = mysqli_fetch_assoc($resultado);

$id = $fila['siguiente_id'];

if($id == null){
    $id = 1;
}

$sql = "INSERT INTO doctores (id_doctor, nombre, especialidad, ciudad)
VALUES ('$id', '$nombre', '$especialidad', '$ciudad')";

if(mysqli_query($conexion, $sql)){
    echo "Doctor guardado con éxito. <a href='formulario.html'>Volver</a>";
} else {
    echo "Error: " . mysqli_error($conexion);
}
?>